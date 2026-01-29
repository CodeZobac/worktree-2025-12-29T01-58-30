'use client';

import React, { useState, useMemo } from 'react';
import { Recipe } from '@/types';
import { Search, X, ChefHat, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface RecipeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (recipeId: string) => void;
    recipes: Recipe[];
    mealType: 'LUNCH' | 'DINNER';
    date: Date;
}

export function RecipeSelector({
    isOpen,
    onClose,
    onSelect,
    recipes,
    mealType,
    date,
}: RecipeSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = useMemo(() => {
        return recipes.filter((recipe) =>
            recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [recipes, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800 pb-safe"
            >
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Select {mealType === 'LUNCH' ? 'Lunch' : 'Dinner'}
                        </h2>
                        <p className="text-xs text-neutral-500">
                            {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors touch-manipulation"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search recipes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Recipe List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredRecipes.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No recipes found</p>
                        </div>
                    ) : (
                        filteredRecipes.map((recipe) => (
                            <button
                                key={recipe.id}
                                onClick={() => onSelect(recipe.id)}
                                className="w-full text-left p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all group flex gap-4"
                            >
                                <div className="w-16 h-16 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                                    {recipe.imageUrl ? (
                                        <img
                                            src={recipe.imageUrl}
                                            alt={recipe.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                            <ChefHat className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-neutral-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {recipe.name}
                                    </h3>
                                    <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                                        {recipe.description || 'No description'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                                        {recipe.cookingTime && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {recipe.cookingTime}m
                                            </div>
                                        )}
                                        {recipe.servings && (
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {recipe.servings}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
