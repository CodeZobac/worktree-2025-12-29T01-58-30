"use client";

import React from 'react';
import Image from 'next/image';
import BlurText from '@/components/BlurText';
import AnimatedList from '@/components/AnimatedList';
import { motion } from 'motion/react';
import { TrixContent } from '@/react-trix';
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
      {/* Hero Section with Image */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-72 sm:h-96 md:h-[28rem] rounded-2xl overflow-hidden mb-8 shadow-xl"
        role="img" 
        aria-label={recipe.imageUrl ? `Photo of ${recipe.name}` : 'No recipe photo available'}
      >
        {recipe.imageUrl ? (
          <>
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
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <svg
                className="w-28 h-28 text-primary/60 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="No recipe image"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-primary/70 font-medium text-lg">No image available</p>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Recipe Header */}
      <div className="mb-8">
        <BlurText
          text={recipe.name}
          delay={100}
          animateBy="words"
          direction="top"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight"
        />

        {/* Meta Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-wrap items-center gap-3"
        >
          {recipe.user && (
            <div className="inline-flex items-center px-4 py-2 bg-card rounded-full shadow-sm border border-border">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground">{recipe.user.name}</span>
            </div>
          )}
          {recipe.cookingTime && (
            <div className="inline-flex items-center px-4 py-2 bg-card rounded-full shadow-sm border border-border">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mr-2">
                <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground">{recipe.cookingTime} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="inline-flex items-center px-4 py-2 bg-card rounded-full shadow-sm border border-border">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground">{recipe.servings} servings</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Description Card */}
      {recipe.description && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mb-8 p-6 bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-md border border-border"
        >
          <div className="prose prose-warm max-w-none">
            <TrixContent html={recipe.description} className="recipe-content" />
          </div>
        </motion.div>
      )}

      {/* Action Buttons (Edit/Delete) */}
      {isOwner && (onEdit || onDelete) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mb-8" 
          role="group" 
          aria-label="Recipe actions"
        >
          {onEdit && (
            <motion.button
              onClick={onEdit}
              aria-label={`Edit ${recipe.name}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-medium shadow-md hover:shadow-lg touch-manipulation min-h-[48px]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Recipe
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              onClick={onDelete}
              aria-label={`Delete ${recipe.name}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive hover:text-destructive-foreground active:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-medium touch-manipulation min-h-[48px]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Recipe
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        {/* Ingredients Section - Sidebar */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="lg:col-span-2 bg-card rounded-2xl shadow-md border border-border overflow-hidden" 
          aria-labelledby="ingredients-heading"
        >
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border">
            <h2 id="ingredients-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Ingredients
              <span className="ml-auto text-sm font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                {recipe.ingredients.length} items
              </span>
            </h2>
          </div>
          <div className="p-5">
            <AnimatedList stagger={0.04} duration={0.25}>
              <ul className="space-y-1" role="list">
                {recipe.ingredients.map((ingredient, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    whileHover={{ x: 4 }}
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{ingredient}</span>
                  </motion.li>
                ))}
              </ul>
            </AnimatedList>
          </div>
        </motion.section>

        {/* Instructions Section - Main Content */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="lg:col-span-3 bg-card rounded-2xl shadow-md border border-border overflow-hidden" 
          aria-labelledby="instructions-heading"
        >
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 px-6 py-4 border-b border-border">
            <h2 id="instructions-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Instructions
            </h2>
          </div>
          <div className="p-6">
            <div className="prose prose-warm max-w-none">
              <TrixContent html={recipe.instructions} className="recipe-content recipe-instructions" />
            </div>
          </div>
        </motion.section>
      </div>

      {/* Recipe Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="mt-10 pt-6 border-t border-border"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              Created {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>
                Updated {new Date(recipe.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </article>
  );
};

export default RecipeDetail;
