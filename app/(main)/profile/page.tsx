import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./ProfileClient";

async function getProfileData(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      familyId: true,
      houseId: true,
      family: {
        select: {
          id: true,
          name: true,
        },
      },
      house: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  let houses: { id: string; name: string; memberCount: number }[] = [];

  if (user.familyId) {
    const familyHouses = await prisma.house.findMany({
      where: { familyId: user.familyId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: {
          select: { users: true },
        },
      },
    });

    houses = familyHouses.map((h: { id: string; name: string; _count: { users: number } }) => ({
      id: h.id,
      name: h.name,
      memberCount: h._count.users,
    }));
  }

  return {
    user,
    houses,
  };
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const data = await getProfileData(session.user.email);

  if (!data) {
    redirect("/login");
  }

  return <ProfileClient user={data.user} houses={data.houses} />;
}
