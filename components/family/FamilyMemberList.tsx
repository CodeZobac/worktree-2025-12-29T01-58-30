"use client";

import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AnimatedList from "@/components/AnimatedList";
import { motion } from "motion/react";
import { FamilyMember } from "@/types";

interface FamilyMemberListProps {
  members: FamilyMember[];
  selectedId?: string;
  onSelect: (memberId: string) => void;
  currentUserId: string;
}

export function FamilyMemberList({
  members,
  selectedId,
  onSelect,
  currentUserId,
}: FamilyMemberListProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      <AnimatedList stagger={0.08} duration={0.35}>
        {members.map((member) => {
          const isActive =
            selectedId === member.id ||
            (pathname === "/" && member.id === currentUserId);
          const href =
            member.id === currentUserId ? "/" : `/family/${member.id}`;

          return (
            <motion.div
              key={member.id}
              className="w-full"
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={href}
                onClick={() => onSelect(member.id)}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200
                  touch-manipulation min-h-[52px]
                  ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 active:bg-sidebar-accent/70 text-sidebar-foreground"
                  }
                `}
              >
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-sidebar-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-sidebar-primary-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.name}
                    {member.id === currentUserId && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.recipeCount}{" "}
                    {member.recipeCount === 1 ? "recipe" : "recipes"}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </AnimatedList>
    </div>
  );
}
