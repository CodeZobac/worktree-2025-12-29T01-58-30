import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get current user's familyIds
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

    // Fetch member data (must be in same family)
    const member = await prisma.user.findFirst({
      where: {
        id: id,
        familyId: userData.familyId
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: { message: 'Family member not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Unexpected error in GET /api/family/members/[id]:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
