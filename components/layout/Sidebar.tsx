"use client";

import { Plus, X, Home, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { FamilyMemberList } from "@/components/family/FamilyMemberList";
import { FamilyMember } from "@/types";

interface House {
  id: string;
  name: string;
}

interface SidebarProps {
  familyMembers: FamilyMember[];
  currentUserId: string;
  selectedMemberId?: string;
  isMobileOpen?: boolean;
  onClose?: () => void;
  houses?: House[];
}

export function Sidebar({
  familyMembers,
  currentUserId,
  selectedMemberId,
  isMobileOpen = false,
  onClose,
  houses = [],
}: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleMemberSelect = (memberId: string) => {
    handleLinkClick();
  };

  // Group members by house
  const groupedMembers = useMemo(() => {
    const groups: { house: House | null; members: FamilyMember[] }[] = [];
    
    // Group members by house
    const houseMap = new Map<string | null, FamilyMember[]>();
    
    familyMembers.forEach(member => {
      const houseId = member.houseId || null;
      if (!houseMap.has(houseId)) {
        houseMap.set(houseId, []);
      }
      houseMap.get(houseId)!.push(member);
    });

    // Add houses with members first
    houses.forEach(house => {
      const members = houseMap.get(house.id);
      if (members && members.length > 0) {
        groups.push({ house, members });
        houseMap.delete(house.id);
      }
    });

    // Add members without a house at the end
    const noHouseMembers = houseMap.get(null);
    if (noHouseMembers && noHouseMembers.length > 0) {
      groups.push({ house: null, members: noHouseMembers });
    }

    return groups;
  }, [familyMembers, houses]);

  const hasHouses = houses.length > 0;

  return (
    <>
      {/* Mobile Backdrop with fade animation */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with slide animation */}
      <aside
        className={`
          w-64 border-r border-border bg-sidebar h-[calc(100vh-4rem)] flex flex-col
          md:sticky md:top-16
          fixed top-16 left-0 z-40 
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors touch-manipulation"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add Recipe & Calendar Buttons */}
        <div className="p-4 border-b border-sidebar-border space-y-2">
          <motion.div
            className="w-full"
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/recipes/new"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors touch-manipulation min-h-[44px]"
            >
              <Plus className="h-5 w-5" />
              Add Recipe
            </Link>
          </motion.div>

          <motion.div
            className="w-full"
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/calendar"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-sidebar-border bg-sidebar text-sidebar-foreground px-4 py-3 font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors touch-manipulation min-h-[44px]"
            >
              <span className="text-lg">📅</span>
              Meal Calendar
            </Link>
          </motion.div>
        </div>

        {/* Family Members List - Touch-friendly scrolling */}
        <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
          {/* Family Recipe Book Link */}
          <div className="mb-4">
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/family/recipes"
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200
                  touch-manipulation min-h-[52px] font-medium
                  ${pathname === '/family/recipes'
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100'
                  }
                `}
              >
                <div className="h-9 w-9 rounded-full bg-orange-200 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Family Recipe Book</p>
                  <p className="text-xs text-orange-500">All family recipes</p>
                </div>
              </Link>
            </motion.div>
          </div>

          <h3 className="text-sm font-semibold text-sidebar-foreground mb-3 px-2">
            Family Members
          </h3>
          {mounted && (
            hasHouses ? (
              // Grouped by house view
              <div className="space-y-4">
                {groupedMembers.map((group, index) => (
                  <div key={group.house?.id || 'no-house'}>
                    {/* House Header */}
                    <div className="flex items-center gap-2 px-2 mb-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {group.house?.name || 'No House'}
                      </span>
                    </div>
                    <FamilyMemberList
                      members={group.members}
                      selectedId={selectedMemberId}
                      onSelect={handleMemberSelect}
                      currentUserId={currentUserId}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Flat list view (no houses)
              <FamilyMemberList
                members={familyMembers}
                selectedId={selectedMemberId}
                onSelect={handleMemberSelect}
                currentUserId={currentUserId}
              />
            )
          )}
        </div>
      </aside>
    </>
  );
}
