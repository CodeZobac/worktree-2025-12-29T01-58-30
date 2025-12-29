'use client';

import React from 'react';
import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
} from 'date-fns';
import { DayCell } from './DayCell';
import { MealPlan } from '@/types';

interface WeekViewProps {
    currentDate: Date;
    mealPlans: MealPlan[];
    onAddMeal: (date: Date, type: 'LUNCH' | 'DINNER') => void;
    onDeleteMeal: (id: string) => void;
}

export function WeekView({ currentDate, mealPlans, onAddMeal, onDeleteMeal }: WeekViewProps) {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
                {weekDays.map((day, index) => (
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
                        <div key={day.toString()} className="min-h-[300px] flex flex-col">
                            <DayCell
                                day={day}
                                currentMonth={currentDate}
                                mealPlans={dayMeals}
                                onAddMeal={onAddMeal}
                                onDeleteMeal={onDeleteMeal}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
