import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// GET /api/houses - Get all houses for the current user's family
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { familyId: true },
    });

    if (!user?.familyId) {
      return NextResponse.json({ error: "No family found" }, { status: 404 });
    }

    const houses = await prisma.house.findMany({
      where: { familyId: user.familyId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { users: true },
        },
        creator: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(houses);
  } catch (error) {
    console.error("Error fetching houses:", error);
    return NextResponse.json(
      { error: "Failed to fetch houses" },
      { status: 500 }
    );
  }
}

// POST /api/houses - Create a new house
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, familyId: true },
    });

    if (!user?.familyId) {
      return NextResponse.json({ error: "No family found" }, { status: 404 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "House name is required" },
        { status: 400 }
      );
    }

    const house = await prisma.house.create({
      data: {
        name: name.trim(),
        familyId: user.familyId,
        createdBy: user.id,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json(house, { status: 201 });
  } catch (error) {
    console.error("Error creating house:", error);
    return NextResponse.json(
      { error: "Failed to create house" },
      { status: 500 }
    );
  }
}
