"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import BlurText from '@/components/BlurText';
import RecipeForm from '@/components/recipes/RecipeForm';
import { PageLoadingState } from '@/components/loading';
import { recipeToasts } from '@/components/toast';
import { Recipe, RecipeFormData } from '@/types';

export default function EditRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // If not authenticated, we can't fetch protected data
      if (status !== 'authenticated') {
        if (status === 'unauthenticated') {
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch recipe by ID
        const recipeResponse = await fetch(`/api/recipes/${recipeId}`);

        if (!recipeResponse.ok) {
          if (recipeResponse.status === 404) {
            setError('Recipe not found');
          } else {
            throw new Error('Failed to fetch recipe');
          }
          return;
        }

        const recipeData = await recipeResponse.json();

        // Check if user owns the recipe
        if (recipeData.userId !== session?.user?.id) {
          setError('You can only edit your own recipes');
          return;
        }

        setRecipe(recipeData);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status, recipeId, session?.user?.id]);

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      // Convert image file to base64 if present
      let imageFile = null;
      if (data.image) {
        const reader = new FileReader();
        imageFile = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.image as File);
        });
      }

      // Submit to API
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          ingredients: data.ingredients,
          instructions: data.instructions,
          cookingTime: data.cookingTime,
          servings: data.servings,
          imageFile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update recipe');
      }

      // Show success toast
      recipeToasts.updated();

      // Redirect to recipe detail page
      router.push(`/recipes/${recipeId}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      recipeToasts.updateError();
      throw error; // Let RecipeForm handle the error display
    }
  };

  const handleCancel = () => {
    router.push(`/recipes/${recipeId}`);
  };

  if (isLoading) {
    return <PageLoadingState message="Loading recipe..." />;
  }

  if (error || !recipe) {
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
          text={error || 'Recipe not found'}
          delay={150}
          animateBy="words"
          direction="top"
          className="text-red-600 text-xl"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Title with BlurText */}
      <BlurText
        text="Edit Recipe"
        delay={150}
        animateBy="words"
        direction="top"
        className="text-4xl font-bold text-foreground"
      />

      {/* Recipe Form */}
      <RecipeForm
        recipe={recipe}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
