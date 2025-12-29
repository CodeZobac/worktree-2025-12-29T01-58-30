"use client";

import React from 'react';
import RecipeCardSkeleton from './RecipeCardSkeleton';

interface RecipeGridSkeletonProps {
  count?: number;
}

const RecipeGridSkeleton: React.FC<RecipeGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <RecipeCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default RecipeGridSkeleton;
