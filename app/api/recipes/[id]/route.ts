import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { saveRecipeImage, deleteImage } from '@/lib/storage';

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

    // Fetch recipe
    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        familyId: userData.familyId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: { message: 'Recipe not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Transform result (parse JSONs)
    const transformedRecipe = {
      ...recipe,
      ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
      instructions: typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions,
      categoryIds: typeof recipe.categoryIds === 'string' ? JSON.parse(recipe.categoryIds) : (recipe.categoryIds || []),
    };

    return NextResponse.json(transformedRecipe);
  } catch (error) {
    console.error('Unexpected error in GET /api/recipes/[id]:', error);
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
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = await params;

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

    // Verify ownership
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      select: { userId: true, imageUrl: true }
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: { message: 'Recipe not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (existingRecipe.userId !== userData.id) {
      return NextResponse.json(
        { error: { message: 'Forbidden', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Parse body
    const body = await request.json();
    const { name, description, ingredients, instructions, cookingTime, servings, imageFile, folderId, categoryIds } = body;

    let imageUrl = existingRecipe.imageUrl;

    if (imageFile) {
      try {
        // Delete old
        if (existingRecipe.imageUrl) {
          await deleteImage(existingRecipe.imageUrl);
        }
        // Save new
        imageUrl = await saveRecipeImage(imageFile);
      } catch (e) {
        console.error('Error processing image:', e);
        return NextResponse.json(
          { error: { message: 'Failed to process image', code: 'UPLOAD_ERROR' } },
          { status: 500 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (ingredients !== undefined) updateData.ingredients = JSON.stringify(ingredients);
    if (instructions !== undefined) updateData.instructions = JSON.stringify(instructions);
    if (cookingTime !== undefined) updateData.cookingTime = cookingTime;
    if (servings !== undefined) updateData.servings = servings;
    if (imageUrl !== existingRecipe.imageUrl) updateData.imageUrl = imageUrl;
    if (folderId !== undefined) updateData.folderId = folderId || null;
    if (categoryIds !== undefined) updateData.categoryIds = JSON.stringify(categoryIds);

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    const responseRecipe = {
      ...updatedRecipe,
      ingredients: JSON.parse(updatedRecipe.ingredients),
      instructions: JSON.parse(updatedRecipe.instructions),
      categoryIds: typeof updatedRecipe.categoryIds === 'string' ? JSON.parse(updatedRecipe.categoryIds) : (updatedRecipe.categoryIds || []),
    };

    return NextResponse.json(responseRecipe);
  } catch (error) {
    console.error('Unexpected error in PUT /api/recipes/[id]:', error);
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
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = await params;

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
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      select: { userId: true, imageUrl: true }
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: { message: 'Recipe not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (existingRecipe.userId !== userData.id) {
      return NextResponse.json(
        { error: { message: 'Forbidden', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Delete image if exists
    if (existingRecipe.imageUrl) {
      await deleteImage(existingRecipe.imageUrl);
    }

    await prisma.recipe.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/recipes/[id]:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
