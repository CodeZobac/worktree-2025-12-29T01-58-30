'use client';

import React from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
} from 'date-fns';
import { DayCell } from './DayCell';
import { MealPlan } from '@/types';

interface MonthViewProps {
    currentDate: Date;
    mealPlans: MealPlan[];
    onAddMeal: (date: Date, type: 'LUNCH' | 'DINNER') => void;
    onDeleteMeal: (id: string) => void;
}

export function MonthView({ currentDate, mealPlans, onAddMeal, onDeleteMeal }: MonthViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            {/* Scrollable container for mobile */}
            <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {days.map((day) => {
                            const dayMeals = mealPlans.filter(
                                (plan) => format(plan.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                            );

                            return (
                                <DayCell
                                    key={day.toString()}
                                    day={day}
                                    currentMonth={currentDate}
                                    mealPlans={dayMeals}
                                    onAddMeal={onAddMeal}
                                    onDeleteMeal={onDeleteMeal}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
