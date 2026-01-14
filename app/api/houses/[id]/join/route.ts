import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// POST /api/houses/[id]/join - Join a house
export async function POST(
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

    const house = await prisma.house.findFirst({
      where: {
        id,
        familyId: user.familyId,
      },
    });

    if (!house) {
      return NextResponse.json({ error: "House not found" }, { status: 404 });
    }

    // Update user's house assignment
    await prisma.user.update({
      where: { id: user.id },
      data: { houseId: id },
    });

    return NextResponse.json({ success: true, houseId: id });
  } catch (error) {
    console.error("Error joining house:", error);
    return NextResponse.json(
      { error: "Failed to join house" },
      { status: 500 }
    );
  }
}

// DELETE /api/houses/[id]/join - Leave a house
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
      select: { id: true, houseId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.houseId !== id) {
      return NextResponse.json(
        { error: "You are not a member of this house" },
        { status: 400 }
      );
    }

    // Remove user from house
    await prisma.user.update({
      where: { id: user.id },
      data: { houseId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving house:", error);
    return NextResponse.json(
      { error: "Failed to leave house" },
      { status: 500 }
    );
  }
}
