"use client";

import React from 'react';
import AnimatedList from '@/components/AnimatedList';
import BlurText from '@/components/BlurText';
import RecipeCard3D from './RecipeCard3D';
import { Recipe } from '@/types';

interface RecipeListProps {
  recipes: Recipe[];
  emptyMessage?: string;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  emptyMessage = 'No recipes found. Start by adding your first recipe!',
}) => {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <svg
          className="w-24 h-24 text-gray-300 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <BlurText
          text={emptyMessage}
          delay={150}
          animateBy="words"
          direction="top"
          className="text-gray-500 text-center text-lg max-w-md"
        />
      </div>
    );
  }

  return (
    <AnimatedList
      stagger={0.1}
      duration={0.4}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
    >
      {recipes.map((recipe) => (
        <RecipeCard3D key={recipe.id} recipe={recipe} />
      ))}
    </AnimatedList>
  );
};

export default RecipeList;
