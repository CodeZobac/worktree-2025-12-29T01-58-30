import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { generateId } from '@/lib/utils/cuid';

type UserData = {
  id: string;
  email: string;
  family_id: string | null;
};

// Create a new family for the current user
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
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: { message: 'Family name is required', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Get current user
    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, familyId: true }
    });

    console.log('POST /api/family - User lookup:', { 
      email: session.user.email, 
      found: !!userData, 
      familyId: userData?.familyId 
    });

    if (!userData) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if user already has a family
    if (userData.familyId) {
      return NextResponse.json(
        { error: { message: 'User already belongs to a family', code: 'ALREADY_IN_FAMILY' } },
        { status: 400 }
      );
    }

    const familyId = generateId();

    try {
      // Use transaction to create family and update user
      const result = await prisma.$transaction(async (tx: any) => {
        // Create family
        const newFamily = await tx.family.create({
          data: {
            id: familyId,
            name: name.trim(),
            createdBy: userData.id,
          }
        });

        // Update user
        await tx.user.update({
          where: { id: userData.id },
          data: { familyId: newFamily.id }
        });

        return newFamily;
      });

      return NextResponse.json(result, { status: 201 });
    } catch (dbError) {
      console.error('Error creating family transaction:', dbError);
      return NextResponse.json(
        { error: { message: 'Failed to create family', code: 'CREATE_FAILED' } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/family:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
