"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Filter, ChefHat, Loader2 } from 'lucide-react';
import BlurText from '@/components/BlurText';
import { Stack, StackRef } from '@/components/stack';
import RecipeStackCard from '@/components/recipes/RecipeStackCard';
import FamilySetupPrompt from '@/components/family/FamilySetupPrompt';
import { PageLoadingState } from '@/components/loading';
import { Recipe, RecipeFolder } from '@/types';

// Predefined category colors for filtering
const CATEGORY_COLORS: Record<string, string> = {
  all: 'bg-gradient-to-r from-orange-500 to-red-500',
  meat: 'bg-gradient-to-r from-red-600 to-red-800',
  fish: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  vegetarian: 'bg-gradient-to-r from-green-500 to-emerald-600',
  desserts: 'bg-gradient-to-r from-pink-500 to-purple-500',
  breakfast: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  pasta: 'bg-gradient-to-r from-amber-500 to-yellow-600',
  salads: 'bg-gradient-to-r from-lime-500 to-green-500',
  soups: 'bg-gradient-to-r from-orange-400 to-amber-500',
  default: 'bg-gradient-to-r from-gray-500 to-gray-700',
};

// Get color for a category name
function getCategoryColor(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lowerName.includes(key)) {
      return color;
    }
  }
  return CATEGORY_COLORS.default;
}

export default function RecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const stackRef = useRef<StackRef>(null);
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [folders, setFolders] = useState<RecipeFolder[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch recipes and folders
  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        if (status === 'unauthenticated') {
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (!session.user.familyId) {
          setHasFamily(false);
          setIsLoading(false);
          return;
        }

        setHasFamily(true);

        // Fetch recipes and folders in parallel
        const [recipesRes, foldersRes] = await Promise.all([
          fetch('/api/recipes'),
          fetch('/api/folders')
        ]);

        if (!recipesRes.ok) {
          throw new Error('Failed to fetch recipes');
        }

        const recipesData = await recipesRes.json();
        setRecipes(recipesData);
        setFilteredRecipes(recipesData);

        if (foldersRes.ok) {
          const foldersData = await foldersRes.json();
          setFolders(foldersData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load recipes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  // Filter recipes when folder selection changes
  useEffect(() => {
    if (selectedFolder === null) {
      setFilteredRecipes(recipes);
    } else if (selectedFolder === 'uncategorized') {
      // Uncategorized: no categoryIds or empty categoryIds, and no folderId
      setFilteredRecipes(recipes.filter(r => 
        (!r.categoryIds || r.categoryIds.length === 0) && !r.folderId
      ));
    } else {
      // Filter by categoryIds (new multi-category system) or folderId (legacy)
      setFilteredRecipes(recipes.filter(r => 
        (r.categoryIds && r.categoryIds.includes(selectedFolder)) || r.folderId === selectedFolder
      ));
    }
  }, [selectedFolder, recipes]);

  // Handle card click - navigate to recipe detail
  const handleCardClick = useCallback((index: number) => {
    const recipe = filteredRecipes[index];
    if (recipe) {
      router.push(`/recipes/${recipe.id}`);
    }
  }, [filteredRecipes, router]);

  // Handle shuffle/random button
  const handleShuffle = useCallback(() => {
    if (stackRef.current && !isShuffling) {
      setIsShuffling(true);
      stackRef.current.shuffle();
      
      // Reset after animation
      setTimeout(() => {
        setIsShuffling(false);
      }, 600);
    }
  }, [isShuffling]);

  // Handle filter selection
  const handleFilterSelect = (folderId: string | null) => {
    setSelectedFolder(folderId);
    setShowFilters(false);
  };

  // Loading state
  if (status === 'loading' || (isLoading && hasFamily !== false)) {
    return <PageLoadingState />;
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <ChefHat className="w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Recipes</h2>
        <p className="text-gray-600">Please sign in to view your family recipes.</p>
      </div>
    );
  }

  // No family setup
  if (hasFamily === false) {
    return (
      <div className="p-8">
        <FamilySetupPrompt onSuccess={() => window.location.reload()} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No recipes
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <ChefHat className="w-20 h-20 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Recipes Yet</h2>
        <p className="text-gray-600 mb-6">Start by adding your first recipe!</p>
        <button
          onClick={() => router.push('/recipes/new')}
          className="px-8 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
        >
          Add Your First Recipe
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <BlurText
          text="Recipe Stack"
          delay={100}
          className="text-4xl sm:text-5xl font-black text-gray-900 mb-4"
        />
        <p className="text-gray-600 text-lg">
          Swipe through your recipes or tap the top card to view details
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-wrap items-center gap-4">
        {/* Filter Button */}
        <div className="relative">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg ${
              selectedFolder !== null
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-5 h-5" />
            <span>
              {selectedFolder === null
                ? 'All Recipes'
                : selectedFolder === 'uncategorized'
                ? 'Uncategorized'
                : folders.find(f => f.id === selectedFolder)?.name || 'Filter'}
            </span>
          </motion.button>

          {/* Filter Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-2">
                  <button
                    onClick={() => handleFilterSelect(null)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      selectedFolder === null
                        ? 'bg-orange-100 text-orange-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-semibold">All Recipes</span>
                    <span className="text-gray-500 ml-2">({recipes.length})</span>
                  </button>
                  
                  {folders.length > 0 && (
                    <>
                      <div className="border-t border-gray-100 my-2" />
                      {folders.map(folder => {
                        const count = recipes.filter(r => r.folderId === folder.id).length;
                        return (
                          <button
                            key={folder.id}
                            onClick={() => handleFilterSelect(folder.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 ${
                              selectedFolder === folder.id
                                ? 'bg-orange-100 text-orange-700'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${getCategoryColor(folder.name)}`}
                            />
                            <span className="font-semibold flex-1">{folder.name}</span>
                            <span className="text-gray-500">({count})</span>
                          </button>
                        );
                      })}
                    </>
                  )}
                  
                  {/* Uncategorized option */}
                  {recipes.some(r => !r.folderId) && (
                    <>
                      <div className="border-t border-gray-100 my-2" />
                      <button
                        onClick={() => handleFilterSelect('uncategorized')}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                          selectedFolder === 'uncategorized'
                            ? 'bg-orange-100 text-orange-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold">Uncategorized</span>
                        <span className="text-gray-500 ml-2">
                          ({recipes.filter(r => !r.folderId).length})
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Shuffle/Random Button */}
        <motion.button
          onClick={handleShuffle}
          disabled={isShuffling || filteredRecipes.length <= 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg ${
            isShuffling
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'
          }`}
          whileTap={{ scale: isShuffling ? 1 : 0.95 }}
          animate={isShuffling ? { rotate: [0, 180, 360] } : {}}
          transition={{ duration: 0.5 }}
        >
          {isShuffling ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Shuffle className="w-5 h-5" />
          )}
          <span>Random</span>
        </motion.button>

        {/* Recipe count */}
        <span className="text-gray-500 text-sm ml-auto">
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
        </span>
      </div>

      {/* Stack Container */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center" style={{ minHeight: '500px' }}>
          {filteredRecipes.length > 0 ? (
            <div 
              className="relative" 
              style={{ 
                width: '100%', 
                maxWidth: '360px', 
                height: '480px' 
              }}
            >
              <Stack
                ref={stackRef}
                randomRotation={true}
                sensitivity={180}
                sendToBackOnClick={true}
                pauseOnHover={true}
                onCardClick={handleCardClick}
                animationConfig={{ stiffness: 300, damping: 25 }}
                cards={filteredRecipes.map((recipe) => (
                  <RecipeStackCard key={recipe.id} recipe={recipe} />
                ))}
              />
            </div>
          ) : (
            <div className="text-center py-16">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No recipes in this category
              </h3>
              <p className="text-gray-500">
                Try selecting a different filter or add more recipes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Swipe or drag cards to browse
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Click top card to view recipe
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Hit Random for a surprise!
          </span>
        </div>
      </div>
    </div>
  );
}
