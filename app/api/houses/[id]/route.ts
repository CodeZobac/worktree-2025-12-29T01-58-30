import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// GET /api/houses/[id] - Get a specific house
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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

    const house = await prisma.house.findFirst({
      where: {
        id,
        familyId: user.familyId,
      },
      include: {
        users: {
          select: { id: true, name: true, image: true, email: true },
        },
        creator: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!house) {
      return NextResponse.json({ error: "House not found" }, { status: 404 });
    }

    return NextResponse.json(house);
  } catch (error) {
    console.error("Error fetching house:", error);
    return NextResponse.json(
      { error: "Failed to fetch house" },
      { status: 500 }
    );
  }
}

// PATCH /api/houses/[id] - Update a house
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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

    const existingHouse = await prisma.house.findFirst({
      where: {
        id,
        familyId: user.familyId,
      },
    });

    if (!existingHouse) {
      return NextResponse.json({ error: "House not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name } = body;

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "House name cannot be empty" },
        { status: 400 }
      );
    }

    const house = await prisma.house.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
      },
    });

    return NextResponse.json(house);
  } catch (error) {
    console.error("Error updating house:", error);
    return NextResponse.json(
      { error: "Failed to update house" },
      { status: 500 }
    );
  }
}

// DELETE /api/houses/[id] - Delete a house
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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

    const existingHouse = await prisma.house.findFirst({
      where: {
        id,
        familyId: user.familyId,
      },
    });

    if (!existingHouse) {
      return NextResponse.json({ error: "House not found" }, { status: 404 });
    }

    // Remove house assignment from all users before deleting
    await prisma.user.updateMany({
      where: { houseId: id },
      data: { houseId: null },
    });

    await prisma.house.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting house:", error);
    return NextResponse.json(
      { error: "Failed to delete house" },
      { status: 500 }
    );
  }
}
