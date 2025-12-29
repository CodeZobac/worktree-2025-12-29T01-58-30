"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import BlurText from '@/components/BlurText';
import RecipeDetail from '@/components/recipes/RecipeDetail';
import DeleteConfirmModal from '@/components/recipes/DeleteConfirmModal';
import { PageLoadingState } from '@/components/loading';
import { recipeToasts } from '@/components/toast';
import { Recipe } from '@/types';

export default function RecipeDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setRecipe(recipeData);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status, recipeId]);

  const handleEdit = () => {
    router.push(`/recipes/${recipeId}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      // Show success toast
      recipeToasts.deleted();

      // Redirect to home after successful deletion
      router.push('/');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      recipeToasts.deleteError();
      setError('Failed to delete recipe. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
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

  const isOwner = session?.user?.id === recipe.userId;

  return (
    <>
      <div className="animate-in fade-in duration-500">
        <RecipeDetail
          recipe={recipe}
          isOwner={isOwner}
          onEdit={isOwner ? handleEdit : undefined}
          onDelete={isOwner ? handleDeleteClick : undefined}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        recipeName={recipe.name}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </>
  );
}
