'use client';

import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { MealPlan } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DayCellProps {
    day: Date;
    currentMonth: Date;
    mealPlans: MealPlan[];
    onAddMeal: (date: Date, type: 'LUNCH' | 'DINNER') => void;
    onDeleteMeal: (id: string) => void;
}

export function DayCell({ day, currentMonth, mealPlans, onAddMeal, onDeleteMeal }: DayCellProps) {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isDayToday = isToday(day);

    const lunch = mealPlans.find((mp) => mp.mealType === 'LUNCH');
    const dinner = mealPlans.find((mp) => mp.mealType === 'DINNER');

    return (
        <div
            className={cn(
                'min-h-[120px] p-2 border-r border-b border-neutral-200 dark:border-neutral-800 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50 flex flex-col gap-2 group relative',
                !isCurrentMonth && 'bg-neutral-50/50 dark:bg-neutral-900/20 text-neutral-400'
            )}
        >
            <div className="flex justify-between items-start">
                <span
                    className={cn(
                        'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                        isDayToday
                            ? 'bg-indigo-600 text-white'
                            : 'text-neutral-700 dark:text-neutral-300'
                    )}
                >
                    {format(day, 'd')}
                </span>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
                {/* Lunch Slot */}
                <MealSlot
                    type="LUNCH"
                    meal={lunch}
                    onAdd={() => onAddMeal(day, 'LUNCH')}
                    onDelete={onDeleteMeal}
                />

                {/* Dinner Slot */}
                <MealSlot
                    type="DINNER"
                    meal={dinner}
                    onAdd={() => onAddMeal(day, 'DINNER')}
                    onDelete={onDeleteMeal}
                />
            </div>
        </div>
    );
}

interface MealSlotProps {
    type: 'LUNCH' | 'DINNER';
    meal?: MealPlan;
    onAdd: () => void;
    onDelete: (id: string) => void;
}

function MealSlot({ type, meal, onAdd, onDelete }: MealSlotProps) {
    if (meal) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    'p-1.5 rounded-md text-xs font-medium truncate group/meal relative pr-6 shadow-sm border',
                    type === 'LUNCH'
                        ? 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800'
                        : 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800'
                )}
            >
                <span className="opacity-75 mr-1">{type === 'LUNCH' ? '☀️' : '🌙'}</span>
                {meal.recipe?.name || 'Unknown Recipe'}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(meal.id);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/meal:opacity-100 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-opacity"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </motion.div>
        );
    }

    return (
        <button
            onClick={onAdd}
            className={cn(
                'h-7 w-full rounded-md border border-dashed flex items-center justify-center gap-1 text-[10px] font-medium transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100',
                type === 'LUNCH'
                    ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20'
                    : 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20'
            )}
        >
            <Plus className="w-3 h-3" />
            Add {type === 'LUNCH' ? 'Lunch' : 'Dinner'}
        </button>
    );
}
