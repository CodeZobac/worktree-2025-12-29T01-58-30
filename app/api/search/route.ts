import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

/**
 * Normalize text for search comparison:
 * - Convert to lowercase
 * - Remove accents and special characters (ç -> c, é -> e, etc.)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose characters (é -> e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[ø]/g, 'o')
    .replace(/[æ]/g, 'ae')
    .replace(/[œ]/g, 'oe')
    .replace(/[ß]/g, 'ss');
}

/**
 * Check if normalized text contains the normalized query
 */
function matchesSearch(text: string | null, normalizedQuery: string): boolean {
  if (!text) return false;
  return normalizeText(text).includes(normalizedQuery);
}

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
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ recipes: [], folders: [] });
    }

    // Fetch familyId directly from database (session may have stale data)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { familyId: true },
    });

    const familyId = user?.familyId;

    if (!familyId) {
      return NextResponse.json(
        { error: { message: 'User not part of a family', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Normalize the search query
    const normalizedQuery = normalizeText(query);
    console.log('[Search API] Query:', query, '| Normalized:', normalizedQuery, '| FamilyId:', familyId);

    // Fetch all recipes for the family (we'll filter in-memory for accent-insensitive search)
    // For larger datasets, consider using a proper search engine like Meilisearch or Algolia
    const allRecipes = await prisma.recipe.findMany({
      where: {
        familyId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        ingredients: true,
        imageUrl: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    console.log('[Search API] Found', allRecipes.length, 'total recipes for family');
    if (allRecipes.length > 0) {
      console.log('[Search API] Recipe names:', allRecipes.map(r => r.name));
    }

    // Filter recipes with normalized comparison
    const matchedRecipes = allRecipes
      .filter((recipe) => 
        matchesSearch(recipe.name, normalizedQuery) ||
        matchesSearch(recipe.description, normalizedQuery) ||
        matchesSearch(recipe.ingredients, normalizedQuery)
      )
      .slice(0, 10);

    console.log('[Search API] Matched', matchedRecipes.length, 'recipes');

    // Fetch all folders for the family
    const allFolders = await prisma.recipeFolder.findMany({
      where: {
        familyId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        createdAt: true,
        _count: {
          select: { recipes: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter folders with normalized comparison
    const matchedFolders = allFolders
      .filter((folder) =>
        matchesSearch(folder.name, normalizedQuery) ||
        matchesSearch(folder.description, normalizedQuery)
      )
      .slice(0, 5);

    return NextResponse.json({
      recipes: matchedRecipes.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        imageUrl: recipe.imageUrl,
        author: recipe.user.name,
      })),
      folders: matchedFolders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        description: folder.description,
        color: folder.color,
        icon: folder.icon,
        recipeCount: folder._count.recipes,
      })),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
