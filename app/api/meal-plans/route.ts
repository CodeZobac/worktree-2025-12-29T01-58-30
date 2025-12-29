import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
                { status: 401 }
            );
        }

        const { recipeId, date, mealType, userId, familyId } = await request.json();

        // 1. Create Meal Plan in DB
        const mealPlan = await prisma.mealPlan.create({
            data: {
                userId,
                familyId,
                recipeId,
                date: new Date(date),
                mealType,
            },
            include: {
                recipe: true
            }
        });

        // 2. Add to Google Calendar (Fire and Forget or Log Error but don't fail request)
        if (session.accessToken && mealPlan.recipe) {
            try {
                // Calculate start and end time (Layout: Lunch at 12:00, Dinner at 19:00, duration 1h)
                const eventDate = new Date(date);
                const isLunch = mealType === 'LUNCH';

                // Set hours
                eventDate.setHours(isLunch ? 12 : 19, 0, 0, 0);
                const startDateStr = eventDate.toISOString();

                const endDate = new Date(eventDate);
                endDate.setHours(isLunch ? 13 : 20, 0, 0, 0);
                const endDateStr = endDate.toISOString();

                const calendarEvent = {
                    summary: `${isLunch ? 'Lunch' : 'Dinner'}: ${mealPlan.recipe.name}`,
                    description: `Recipe: ${mealPlan.recipe.name}\n${mealPlan.recipe.description || ''}`,
                    start: {
                        dateTime: startDateStr,
                        timeZone: 'UTC', // Or user's timezone if available, sticking to UTC/local logic from date object
                    },
                    end: {
                        dateTime: endDateStr,
                        timeZone: 'UTC',
                    },
                };

                const calendarRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(calendarEvent),
                });

                if (calendarRes.ok) {
                    console.log(`Google Calendar event created for ${mealPlan.id}`);
                } else {
                    const errorJson = await calendarRes.json();
                    console.error('Failed to create Google Calendar event:', errorJson);
                }
            } catch (calError) {
                console.error('Error creating Google Calendar event:', calError);
            }
        }

        return NextResponse.json(mealPlan);
    } catch (error) {
        console.error('Unexpected error in POST /api/meal-plans:', error);
        return NextResponse.json(
            { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
            { status: 500 }
        );
    }
}
