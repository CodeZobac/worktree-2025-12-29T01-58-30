import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { generateId } from '@/lib/utils/cuid';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get user's familyId
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

    // Build filter
    const where: Prisma.RecipeFolderWhereInput = {
      familyId: userData.familyId,
    };

    if (userId) {
      where.userId = userId;
    }

    const folders = await prisma.recipeFolder.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    });

    // Map to include recipeCount as a top-level property
    const foldersWithCounts = folders.map((folder: any) => ({
      ...folder,
      recipeCount: folder._count.recipes,
      _count: undefined // remove the prisma specific field
    }));

    return NextResponse.json(foldersWithCounts);
  } catch (error) {
    console.error('Unexpected error in GET /api/folders:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Get user data
    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, familyId: true }
    });

    if (!userData?.familyId) {
      return NextResponse.json(
        { error: { message: 'User not found or not part of a family', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, color, icon } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: { message: 'Folder name is required', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Create folder
    const folder = await prisma.recipeFolder.create({
      data: {
        id: generateId(),
        userId: userData.id,
        familyId: userData.familyId,
        name,
        description: description || null,
        color: color || '#5227FF',
        icon: icon || 'folder'
      }
    });

    return NextResponse.json({ ...folder, recipeCount: 0 }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/folders:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
