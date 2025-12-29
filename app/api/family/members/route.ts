import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { FamilyMember } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { familyId: true }
    });

    if (!userData?.familyId) {
      return NextResponse.json(
        { error: { message: 'User not found or not part of a family', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Fetch all family members with their recipe counts
    const members = await prisma.user.findMany({
      where: { familyId: userData.familyId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: { recipes: true }
        }
      }
    });

    // Transform the data to match FamilyMember interface
    const familyMembers: FamilyMember[] = members.map((member: any) => ({
      id: member.id,
      name: member.name || '', // Prisma User name is nullable
      image: member.image || undefined,
      recipeCount: member._count.recipes || 0,
    }));

    return NextResponse.json(familyMembers);
  } catch (error) {
    console.error('Unexpected error in GET /api/family/members:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
