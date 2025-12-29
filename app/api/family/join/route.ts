import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode || typeof inviteCode !== 'string') {
      return NextResponse.json(
        { error: { message: 'Invite code is required', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Find family by ID (using ID as invite code for now)
    const family = await prisma.family.findUnique({
      where: { id: inviteCode },
    });

    if (!family) {
      return NextResponse.json(
        { error: { message: 'Invalid invite code', code: 'INVALID_CODE' } },
        { status: 404 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (user.familyId) {
      return NextResponse.json(
        { error: { message: 'User already belongs to a family', code: 'ALREADY_IN_FAMILY' } },
        { status: 400 }
      );
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { familyId: family.id },
    });

    return NextResponse.json({ success: true, familyId: family.id });

  } catch (error) {
    console.error('Error joining family:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
