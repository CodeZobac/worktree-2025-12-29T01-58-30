"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BlurText from '@/components/BlurText';
import RecipeForm from '@/components/recipes/RecipeForm';
import { recipeToasts } from '@/components/toast';
import { RecipeFormData } from '@/types';

export default function NewRecipePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFolderId, setInitialFolderId] = useState<string | undefined>();

  useEffect(() => {
    // Get folder ID from URL params if present
    const folderId = searchParams.get('folderId');
    if (folderId) {
      setInitialFolderId(folderId);
    }
  }, [searchParams]);

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);

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
      const response = await fetch('/api/recipes', {
        method: 'POST',
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
          folderId: data.folderId,
          categoryIds: data.categoryIds,
          imageFile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create recipe');
      }

      const recipe = await response.json();
      
      // Show success toast
      recipeToasts.created();
      
      // Redirect to recipe detail page
      router.push(`/recipes/${recipe.id}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
      recipeToasts.createError();
      throw error; // Let RecipeForm handle the error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Title with BlurText */}
      <BlurText
        text="Create New Recipe"
        delay={150}
        animateBy="words"
        direction="top"
        className="text-4xl font-bold text-foreground"
      />

      {/* Recipe Form */}
      <RecipeForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialFolderId={initialFolderId}
      />
    </div>
  );
}
