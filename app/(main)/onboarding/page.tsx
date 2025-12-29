import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import FamilySetupPrompt from '@/components/family/FamilySetupPrompt';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Welcome | Family Recipes',
    description: 'Set up your family to start sharing recipes',
};

export default async function OnboardingPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    if (session.user.familyId) {
        redirect('/');
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <FamilySetupPrompt userName={session.user.name || undefined} />
        </div>
    );
}
