import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
                { status: 401 }
            );
        }

        const { id } = await params;

        await prisma.mealPlan.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error in DELETE /api/meal-plans/[id]:', error);
        return NextResponse.json(
            { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
            { status: 500 }
        );
    }
}
