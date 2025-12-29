"use client";

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import BlurText from '@/components/BlurText';
import CountUp from '@/components/CountUp';
import RecipeList from '@/components/recipes/RecipeList';
import FamilySetupPrompt from '@/components/family/FamilySetupPrompt';
import { RecipeGridSkeleton } from '@/components/loading';
import { recipeToasts } from '@/components/toast';
import { Recipe } from '@/types';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);

  const fetchRecipes = async () => {
    // If not authenticated or no user email, stop
    if (status !== 'authenticated' || !session?.user?.id) {
      if (status === 'unauthenticated') {
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use familyId from session directly
      // Types are augmented in types/next-auth.d.ts to include familyId
      if (!session.user.familyId) {
        setHasFamily(false);
        setIsLoading(false);
        return;
      }

      setHasFamily(true);

      // Fetch current user's recipes using ID from session
      const response = await fetch(`/api/recipes?userId=${session.user.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again.');
      recipeToasts.loadError();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchRecipes();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status, session?.user?.id, session?.user?.familyId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-muted rounded-lg animate-pulse w-64" />
        <div className="h-8 bg-muted rounded-lg animate-pulse w-32" />
        <RecipeGridSkeleton count={6} />
      </div>
    );
  }

  // Show family setup prompt if user doesn't have a family
  if (hasFamily === false) {
    return (
      <FamilySetupPrompt
        userName={session?.user?.name || undefined}
        onSuccess={() => {
          // Force a reload to ensure all server components and client state are synced
          window.location.reload();
        }}
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg
          className="w-16 h-16 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <BlurText
          text={error}
          delay={100}
          animateBy="words"
          className="text-red-600 text-lg"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title with BlurText */}
      <BlurText
        text="My Recipes"
        delay={150}
        animateBy="words"
        direction="top"
        className="text-4xl font-bold text-foreground"
      />

      {/* Recipe Count with CountUp */}
      {recipes.length > 0 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <CountUp
            end={recipes.length}
            duration={1.5}
            className="text-2xl font-semibold text-primary"
          />
          <span className="text-lg">
            {recipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
        </div>
      )}

      {/* Recipe List with AnimatedList wrapper (handled inside RecipeList) */}
      <RecipeList
        recipes={recipes}
        emptyMessage="No recipes yet. Click 'Add Recipe' to create your first recipe!"
      />
    </div>
  );
}
