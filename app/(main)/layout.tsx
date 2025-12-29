import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { MainLayoutClient } from "@/components/layout/MainLayoutClient";
import { FamilyMember } from "@/types";
import { prisma } from "@/lib/prisma";

async function getFamilyData(userEmail: string): Promise<{ members: FamilyMember[], familyId: string | null }> {
  try {
    const userData = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { familyId: true }
    });

    if (!userData?.familyId) {
      return { members: [], familyId: null };
    }

    const members = await prisma.user.findMany({
      where: { familyId: userData.familyId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: { recipes: true }
        }
      }
    });

    const familyMembers: FamilyMember[] = members.map((member: any) => ({
      id: member.id,
      name: member.name || '',
      image: member.image || undefined,
      recipeCount: member._count.recipes || 0,
    }));

    return { members: familyMembers, familyId: userData.familyId };
  } catch (error) {
    console.error('Error fetching family members:', error);
    return { members: [], familyId: null };
  }
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { members: familyMembers, familyId } = await getFamilyData(session.user.email);

  return (
    <MainLayoutClient
      familyMembers={familyMembers}
      currentUserId={session.user.id || ""}
      familyId={familyId || undefined}
    >
      {children}
    </MainLayoutClient>
  );
}
