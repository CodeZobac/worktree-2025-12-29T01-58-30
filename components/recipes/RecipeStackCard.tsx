"use client";

import Image from 'next/image';
import { Recipe } from '@/types';
import { PLACEHOLDERS } from '@/lib/utils/image-placeholders';
import { Clock, Users, ChefHat } from 'lucide-react';

interface RecipeStackCardProps {
  recipe: Recipe;
}

export default function RecipeStackCard({ recipe }: RecipeStackCardProps) {
  return (
    <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden select-none">
      {/* Recipe Image - Full card background */}
      <div className="absolute inset-0 w-full h-full">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover will-change-transform [transform:translateZ(0)]"
            sizes="(max-width: 768px) 90vw, 400px"
            loading="lazy"
            placeholder="blur"
            blurDataURL={PLACEHOLDERS.card}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 flex items-center justify-center">
            <ChefHat className="w-24 h-24 text-orange-400 opacity-50" />
          </div>
        )}
        
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Recipe Content */}
      <div className="relative h-full flex flex-col justify-between p-6 pointer-events-none">
        {/* Top Section - Title and Description */}
        <div className="space-y-2">
          <h3 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg line-clamp-2 leading-tight">
            {recipe.name}
          </h3>
          {recipe.description && (
            <p className="text-white/80 text-sm sm:text-base line-clamp-2 drop-shadow">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Bottom Section - Meta Info */}
        <div className="flex items-center gap-3 flex-wrap">
          {recipe.cookingTime && (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              <span className="text-gray-900 font-semibold text-sm sm:text-base">
                {recipe.cookingTime} min
              </span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              <span className="text-gray-900 font-semibold text-sm sm:text-base">
                {recipe.servings} servings
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Click hint overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20 pointer-events-none">
        <span className="text-white text-lg font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
          Click to view recipe
        </span>
      </div>
    </div>
  );
}
