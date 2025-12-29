"use client";

import React from 'react';
import Image from 'next/image';
import BlurText from '@/components/BlurText';
import AnimatedList from '@/components/AnimatedList';
import { motion } from 'motion/react';
import { MarkdownRenderer } from '@/components/markdown';
import { Recipe } from '@/types';
import { PLACEHOLDERS } from '@/lib/utils/image-placeholders';

interface RecipeDetailProps {
  recipe: Recipe;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  isOwner,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="max-w-4xl mx-auto" aria-label={`Recipe: ${recipe.name}`}>
      {/* Recipe Image */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden mb-6 sm:mb-8 shadow-lg" role="img" aria-label={recipe.imageUrl ? `Photo of ${recipe.name}` : 'No recipe photo available'}>
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            placeholder="blur"
            blurDataURL={PLACEHOLDERS.detail}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/30">
            <svg
              className="w-24 h-24 text-primary mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="No recipe image"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-primary font-medium">No image available</p>
          </div>
        )}
      </div>

      {/* Recipe Title with BlurText Animation */}
      <BlurText
        text={recipe.name}
        delay={100}
        animateBy="words"
        direction="top"
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
      />

      {/* Recipe Meta Information */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 text-sm sm:text-base text-muted-foreground">
        {recipe.user && (
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="font-medium">{recipe.user.name}</span>
          </div>
        )}
        {recipe.cookingTime && (
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{recipe.cookingTime} minutes</span>
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{recipe.servings} servings</span>
          </div>
        )}
      </div>

      {/* Description */}
      {recipe.description && (
        <div className="mb-6 sm:mb-8">
          <MarkdownRenderer content={recipe.description} />
        </div>
      )}

      {/* Action Buttons (Edit/Delete) */}
      {isOwner && (onEdit || onDelete) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8" role="group" aria-label="Recipe actions">
          {onEdit && (
            <motion.button
              onClick={onEdit}
              aria-label={`Edit ${recipe.name}`}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors font-medium touch-manipulation min-h-[44px]"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
            >
              Edit Recipe
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              onClick={onDelete}
              aria-label={`Delete ${recipe.name}`}
              className="w-full sm:w-auto px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 active:bg-destructive/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors font-medium touch-manipulation min-h-[44px]"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
            >
              Delete Recipe
            </motion.button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Ingredients Section */}
        <section className="bg-card text-card-foreground rounded-xl shadow-md p-5 sm:p-6" aria-labelledby="ingredients-heading">
          <h2 id="ingredients-heading" className="text-xl sm:text-2xl font-bold mb-4">Ingredients</h2>
          <AnimatedList stagger={0.05} duration={0.3}>
            <ul className="list-none" role="list">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-start py-2 border-b border-border last:border-0"
                >
                  <svg
                    className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </AnimatedList>
        </section>

        {/* Instructions Section */}
        <section className="bg-card text-card-foreground rounded-xl shadow-md p-5 sm:p-6" aria-labelledby="instructions-heading">
          <h2 id="instructions-heading" className="text-xl sm:text-2xl font-bold mb-4">Instructions</h2>
          <MarkdownRenderer content={recipe.instructions} />
        </section>
      </div>

      {/* Recipe Metadata */}
      <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
        <p>
          Created on {new Date(recipe.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
          <p className="mt-1">
            Last updated on {new Date(recipe.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </article>
  );
};

export default RecipeDetail;
