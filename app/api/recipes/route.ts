import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { saveRecipeImage } from '@/lib/storage';
import { generateId } from '@/lib/utils/cuid';
import { Prisma } from '@prisma/client';

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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const folderId = searchParams.get('folderId');

    // Use familyId from session directly (populated by auth callbacks)
    const { familyId } = session.user;

    if (!familyId) {
      return NextResponse.json(
        { error: { message: 'User not part of a family', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Build filter
    const where: Prisma.RecipeWhereInput = {
      familyId: familyId,
    };

    if (userId) {
      where.userId = userId;
    }

    if (folderId) {
      if (folderId === 'null' || folderId === 'none') {
        where.folderId = null;
      } else {
        where.folderId = folderId;
      }
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform for frontend (Prisma returns Dates as Date objects, which JSON.stringify handles, but frontend might expect strings or specific format?)
    // Existing frontend transformation used specific fields. Prisma result is already largely compatible except possibly JSON fields.
    // The schema says ingredients/instructions are String (JSON string).

    const transformedRecipes = recipes.map((recipe: any) => ({
      ...recipe,
      // Ensure JSON strings are parsed if they are stored as strings but used as objects, 
      // OR if frontend expects the raw JSON array, existing code just passed `recipe.ingredients` which was likely from Supabase returning a JSON type column as object/array.
      // Schema says: `ingredients String`. So Prisma returns string.
      // Frontend (from previous GET code) expected `recipe.ingredients` to be passed through.
      // If schema is String, we might need to JSON.parse(recipe.ingredients) IF existing frontend expects an array.
      // Previous POST code `JSON.parse`? No, Supabase handles JSON types.
      // Important: Schema comment said `// Stored as JSON string or text`.
      // Let's safe parse them to be sure, assuming frontend wants arrays.
      ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
      instructions: typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions,
    }));

    return NextResponse.json(transformedRecipes);
  } catch (error) {
    console.error('Unexpected error in GET /api/recipes:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Use user data from session directly
    const { id: userId, familyId } = session.user;

    if (!familyId) {
      return NextResponse.json(
        { error: { message: 'User not part of a family', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, ingredients, instructions, cookingTime, servings, imageFile, folderId } = body;

    // Validate required fields
    if (!name || !ingredients || !instructions) {
      return NextResponse.json(
        { error: { message: 'Missing required fields: name, ingredients, instructions', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: { message: 'Ingredients must be a non-empty array', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    // Handle image upload if provided
    if (imageFile) {
      try {
        // Optimized local storage
        imageUrl = await saveRecipeImage(imageFile);
      } catch (uploadError) {
        console.error('Error processing image:', uploadError);
        return NextResponse.json(
          { error: { message: 'Failed to process image', code: 'UPLOAD_ERROR' } },
          { status: 500 }
        );
      }
    }

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        id: generateId(),
        userId: userId,
        familyId: familyId,
        name,
        description: description || null,
        ingredients: JSON.stringify(ingredients), // Store as string if DB expects string
        instructions: JSON.stringify(instructions),
        cookingTime: cookingTime || null,
        servings: servings || null,
        imageUrl,
        folderId: folderId || null,
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

    // Transform result (parse JSONs back for response)
    const responseRecipe = {
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions),
    };

    return NextResponse.json(responseRecipe, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/recipes:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
