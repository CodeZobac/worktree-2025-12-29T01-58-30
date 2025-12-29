import { Metadata } from 'next';
import { CalendarView } from '@/components/calendar/CalendarView';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

export const metadata: Metadata = {
    title: 'Meal Calendar | Family Recipes',
    description: 'Plan your family meals',
};

export default async function CalendarPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    if (!session.user.familyId) {
        redirect('/onboarding');
    }

    // Fetch data for a wide range to cover initial view (current month +/- 1 month just in case)
    const today = new Date();
    const startDate = startOfMonth(subMonths(today, 1));
    const endDate = endOfMonth(addMonths(today, 1));

    const [mealPlansData, recipesData] = await Promise.all([
        prisma.mealPlan.findMany({
            where: {
                familyId: session.user.familyId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                recipe: true
            }
        }),
        prisma.recipe.findMany({
            where: {
                familyId: session.user.familyId
            }
        })
    ]);

    // Cast to any to avoid strict union type issues with SQLite strings
    const mealPlans = mealPlansData as any;
    const recipes = recipesData as any;

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <CalendarView
                initialMealPlans={mealPlans}
                recipes={recipes}
                familyId={session.user.familyId}
                userId={session.user.id}
            />
        </div>
    );
}
