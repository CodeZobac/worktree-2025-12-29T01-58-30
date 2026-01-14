import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { MainLayoutClient } from "@/components/layout/MainLayoutClient";
import { FamilyMember } from "@/types";
import { prisma } from "@/lib/prisma";

interface House {
  id: string;
  name: string;
}

interface FamilyData {
  members: FamilyMember[];
  familyId: string | null;
  houses: House[];
  currentHouseId: string | null;
}

async function getFamilyData(userEmail: string): Promise<FamilyData> {
  try {
    const userData = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { familyId: true, houseId: true }
    });

    if (!userData?.familyId) {
      return { members: [], familyId: null, houses: [], currentHouseId: null };
    }

    const members = await prisma.user.findMany({
      where: { familyId: userData.familyId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        image: true,
        houseId: true,
        house: {
          select: { id: true, name: true }
        },
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
      houseId: member.houseId || undefined,
      houseName: member.house?.name || undefined,
    }));

    // Fetch houses for the family
    const houses = await prisma.house.findMany({
      where: { familyId: userData.familyId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      }
    });

    return { 
      members: familyMembers, 
      familyId: userData.familyId,
      houses: houses,
      currentHouseId: userData.houseId 
    };
  } catch (error) {
    console.error('Error fetching family data:', error);
    return { members: [], familyId: null, houses: [], currentHouseId: null };
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

  const { members: familyMembers, familyId, houses, currentHouseId } = await getFamilyData(session.user.email);

  return (
    <MainLayoutClient
      familyMembers={familyMembers}
      currentUserId={session.user.id || ""}
      familyId={familyId || undefined}
      houses={houses}
      currentHouseId={currentHouseId || undefined}
    >
      {children}
    </MainLayoutClient>
  );
}
