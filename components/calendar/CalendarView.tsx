'use client';

import React, { useState } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, List } from 'lucide-react';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { RecipeSelector } from './RecipeSelector';
import { MealPlan, Recipe } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
    initialMealPlans: MealPlan[];
    recipes: Recipe[];
    familyId: string;
    userId: string;
}

export function CalendarView({ initialMealPlans, recipes, familyId, userId }: CalendarViewProps) {
    const [view, setView] = useState<'month' | 'week'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [mealPlans, setMealPlans] = useState<MealPlan[]>(initialMealPlans);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date; type: 'LUNCH' | 'DINNER' } | null>(null);
    const router = useRouter();

    const handlePrevious = () => {
        if (view === 'month') {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            setCurrentDate(subWeeks(currentDate, 1));
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            setCurrentDate(addMonths(currentDate, 1));
        } else {
            setCurrentDate(addWeeks(currentDate, 1));
        }
    };

    const handleAddMeal = (date: Date, type: 'LUNCH' | 'DINNER') => {
        setSelectedSlot({ date, type });
        setIsSelectorOpen(true);
    };

    const handleDeleteMeal = async (id: string) => {
        const previousPlans = [...mealPlans];
        setMealPlans(mealPlans.filter((p) => p.id !== id));

        try {
            const response = await fetch(`/api/meal-plans/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            toast.success('Meal plan removed');
            router.refresh();
        } catch (error) {
            setMealPlans(previousPlans);
            toast.error('Failed to delete meal plan');
        }
    };

    const handleSelectRecipe = async (recipeId: string) => {
        if (!selectedSlot) return;

        const tempId = Math.random().toString();
        const selectedRecipe = recipes.find(r => r.id === recipeId);

        // Optimistic update
        const newPlan: MealPlan = {
            id: tempId,
            userId,
            familyId,
            recipeId,
            date: selectedSlot.date,
            mealType: selectedSlot.type,
            createdAt: new Date(),
            updatedAt: new Date(),
            recipe: selectedRecipe,
        };

        setMealPlans([...mealPlans, newPlan]);
        setIsSelectorOpen(false);

        setMealPlans([...mealPlans, newPlan]);
        setIsSelectorOpen(false);

        try {
            const response = await fetch('/api/meal-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipeId,
                    date: selectedSlot.date,
                    mealType: selectedSlot.type,
                    userId,
                    familyId,
                }),
            });

            if (!response.ok) throw new Error('Failed to create');

            const data = await response.json();

            // Replace temp ID with real one
            setMealPlans(prev => prev.map(p => p.id === tempId ? data : p));
            toast.success('Meal added to calendar');
            router.refresh();
        } catch (error) {
            setMealPlans(mealPlans); // Revert
            toast.error('Failed to create meal plan');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {format(currentDate, 'MMMM yyyy')}
                    </h1>
                    <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                        <button
                            onClick={handlePrevious}
                            className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-md transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-3 py-1 text-xs font-medium hover:bg-white dark:hover:bg-neutral-700 rounded-md transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-md transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                    <button
                        onClick={() => setView('month')}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                            view === 'month'
                                ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Month
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                            view === 'week'
                                ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        )}
                    >
                        <List className="w-4 h-4" />
                        Week
                    </button>
                </div>
            </div>

            {/* View */}
            {view === 'month' ? (
                <MonthView
                    currentDate={currentDate}
                    mealPlans={mealPlans}
                    onAddMeal={handleAddMeal}
                    onDeleteMeal={handleDeleteMeal}
                />
            ) : (
                <WeekView
                    currentDate={currentDate}
                    mealPlans={mealPlans}
                    onAddMeal={handleAddMeal}
                    onDeleteMeal={handleDeleteMeal}
                />
            )}

            {/* Recipe Selector Modal */}
            <RecipeSelector
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                onSelect={handleSelectRecipe}
                recipes={recipes}
                mealType={selectedSlot?.type || 'LUNCH'}
                date={selectedSlot?.date || new Date()}
            />
        </div>
    );
}
