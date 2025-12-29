import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id: folderId } = await params;

    // Get folder with recipe count
    const folder = await prisma.recipeFolder.findUnique({
      where: { id: folderId },
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    });

    if (!folder) {
      return NextResponse.json(
        { error: { message: 'Folder not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...folder,
      recipeCount: folder._count.recipes,
      _count: undefined
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/folders/[id]:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id: folderId } = await params;

    // Get user data
    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!userData) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Verify ownership
    const folder = await prisma.recipeFolder.findUnique({
      where: { id: folderId },
      select: { userId: true }
    });

    if (!folder) {
      return NextResponse.json(
        { error: { message: 'Folder not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (folder.userId !== userData.id) {
      return NextResponse.json(
        { error: { message: 'Forbidden', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, color, icon } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;

    const updatedFolder = await prisma.recipeFolder.update({
      where: { id: folderId },
      data: updateData,
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    });

    return NextResponse.json({
      ...updatedFolder,
      recipeCount: updatedFolder._count?.recipes || 0,
      _count: undefined
    });
  } catch (error) {
    console.error('Unexpected error in PUT /api/folders/[id]:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id: folderId } = await params;

    // Get user data
    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!userData) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Verify ownership
    const folder = await prisma.recipeFolder.findUnique({
      where: { id: folderId },
      select: { userId: true }
    });

    if (!folder) {
      return NextResponse.json(
        { error: { message: 'Folder not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (folder.userId !== userData.id) {
      return NextResponse.json(
        { error: { message: 'Forbidden', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    await prisma.recipeFolder.delete({
      where: { id: folderId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/folders/[id]:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
