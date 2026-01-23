"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BlurText from '@/components/BlurText';
import CountUp from '@/components/CountUp';
import FolderGrid from '@/components/recipes/FolderGrid';
import FamilySetupPrompt from '@/components/family/FamilySetupPrompt';
import { RecipeGridSkeleton } from '@/components/loading';
import { recipeToasts } from '@/components/toast';
import { RecipeFolder } from '@/types';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [folders, setFolders] = useState<RecipeFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);

  const fetchFolders = async () => {
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
      if (!session.user.familyId) {
        setHasFamily(false);
        setIsLoading(false);
        return;
      }

      setHasFamily(true);

      // Fetch folders
      const response = await fetch('/api/folders');

      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      setFolders(data);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders. Please try again.');
      recipeToasts.loadError();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchFolders();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status, session?.user?.id, session?.user?.familyId]);

  const handleFolderClick = (folder: RecipeFolder) => {
    router.push(`/recipes?folderId=${folder.id}`);
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
        text="My Recipe Folders"
        delay={150}
        animateBy="words"
        direction="top"
        className="text-4xl font-bold text-foreground"
      />

      {/* Folder Count with CountUp */}
      {folders.length > 0 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <CountUp
            end={folders.length}
            duration={1.5}
            className="text-2xl font-semibold text-primary"
          />
          <span className="text-lg">
            {folders.length === 1 ? 'category' : 'categories'}
          </span>
        </div>
      )}

      {/* Folder Grid */}
      <FolderGrid
        folders={folders}
        onFolderClick={handleFolderClick}
      />
    </div>
  );
}
