"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import BlurText from '@/components/BlurText';
import CountUp from '@/components/CountUp';
import RecipeList from '@/components/recipes/RecipeList';
import FolderGrid from '@/components/recipes/FolderGrid';
import CreateFolderModal from '@/components/recipes/CreateFolderModal';
import { RecipeGridSkeleton } from '@/components/loading';
import { recipeToasts } from '@/components/toast';
import FamilySetupPrompt from '@/components/family/FamilySetupPrompt';
import { Recipe, RecipeFolder, RecipeFolderFormData } from '@/types';

export default function FamilyRecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [folders, setFolders] = useState<RecipeFolder[]>([]);
  const [familyName, setFamilyName] = useState<string>('Family');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<RecipeFolder | null>(null);
  const [viewMode, setViewMode] = useState<'folders' | 'recipes'>('folders');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        if (status === 'unauthenticated') {
          setIsLoading(false);
        }
        return;
      }

      // Check for familyId
      if (!session.user.familyId) {
        setHasFamily(false);
        setIsLoading(false);
        return;
      }

      setHasFamily(true);

      try {
        setIsLoading(true);
        setError(null);

        // Fetch ALL family folders and recipes (no userId filter = all family content)
        const [foldersResponse, recipesResponse, familyResponse] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/recipes'),
          fetch('/api/family/members')
        ]);

        if (!foldersResponse.ok) {
          throw new Error('Failed to fetch folders');
        }
        if (!recipesResponse.ok) {
          throw new Error('Failed to fetch recipes');
        }

        const foldersData = await foldersResponse.json();
        const recipesData = await recipesResponse.json();

        setFolders(foldersData);
        setRecipes(recipesData);

        // Try to get family name from members API
        if (familyResponse.ok) {
          const familyData = await familyResponse.json();
          if (familyData.familyName) {
            setFamilyName(familyData.familyName);
          }
        }
      } catch (err) {
        console.error('Error fetching family data:', err);
        setError('Failed to load data. Please try again.');
        recipeToasts.loadError();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status, session?.user?.id, session?.user?.familyId]);

  const handleFolderClick = async (folder: RecipeFolder) => {
    setSelectedFolder(folder);
    setViewMode('recipes');

    // Fetch recipes for this folder (all family members)
    try {
      const response = await fetch(`/api/recipes?folderId=${folder.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (err) {
      console.error('Error fetching folder recipes:', err);
      recipeToasts.loadError();
    }
  };

  const handleBackToFolders = async () => {
    setSelectedFolder(null);
    setViewMode('folders');

    // Reload all family recipes
    try {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
    }
  };

  const handleCreateFolder = async (data: RecipeFolderFormData) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create folder');
      }

      const newFolder = await response.json();
      setFolders([newFolder, ...folders]);
      recipeToasts.created();
    } catch (err) {
      console.error('Error creating folder:', err);
      throw err;
    }
  };

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
      {/* Page Header */}
      <div className="space-y-2">
        <BlurText
          text={selectedFolder ? selectedFolder.name : `${familyName}'s Recipe Book`}
          delay={150}
          animateBy="words"
          direction="top"
          className="text-4xl font-bold text-foreground"
        />

        {/* Stats with CountUp */}
        <div className="flex items-center gap-6 text-muted-foreground">
          {viewMode === 'folders' ? (
            <>
              <div className="flex items-center gap-2">
                <CountUp
                  end={folders.length}
                  duration={1.5}
                  className="text-2xl font-semibold text-primary"
                />
                <span className="text-lg">
                  {folders.length === 1 ? 'folder' : 'folders'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CountUp
                  end={recipes.length}
                  duration={1.5}
                  className="text-2xl font-semibold text-orange-600"
                />
                <span className="text-lg">
                  {recipes.length === 1 ? 'recipe' : 'recipes'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* View Toggle & Back Button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {selectedFolder && (
          <button
            onClick={handleBackToFolders}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to folders
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Add Recipe Button - shown when in folder view */}
          {selectedFolder && (
            <motion.button
              onClick={() => router.push(`/recipes/new?folderId=${selectedFolder.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Recipe
            </motion.button>
          )}

          {/* Create Folder Button */}
          {viewMode === 'folders' && !selectedFolder && (
            <motion.button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 active:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Folder
            </motion.button>
          )}

          {/* View Toggle - only show when there are folders */}
          {!selectedFolder && folders.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('folders')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'folders'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Folders
              </button>
              <button
                onClick={() => setViewMode('recipes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'recipes'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All Recipes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'folders' && !selectedFolder ? (
        <>
          <FolderGrid folders={folders} onFolderClick={handleFolderClick} />
          {folders.length === 0 && (
            <div className="text-center py-8">
              <motion.button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Folder
              </motion.button>
            </div>
          )}
        </>
      ) : (
        <RecipeList
          recipes={recipes}
          emptyMessage={
            selectedFolder
              ? `No recipes in ${selectedFolder.name} yet.`
              : "Your family hasn't added any recipes yet."
          }
        />
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}
