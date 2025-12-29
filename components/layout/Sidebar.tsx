"use client";

import { Plus, X, Copy } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FamilyMemberList } from "@/components/family/FamilyMemberList";
import { FamilyMember } from "@/types";
import { showSuccessToast } from "@/components/toast";

interface SidebarProps {
  familyMembers: FamilyMember[];
  currentUserId: string;
  selectedMemberId?: string;
  isMobileOpen?: boolean;
  onClose?: () => void;
  familyId?: string;
}

export function Sidebar({
  familyMembers,
  currentUserId,
  selectedMemberId,
  isMobileOpen = false,
  onClose,
  familyId,
}: SidebarProps) {
  const [mounted, setMounted] = useState(false);

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

  const handleCopyInviteCode = () => {
    if (familyId) {
      navigator.clipboard.writeText(familyId);
      showSuccessToast("Invite code copied to clipboard!");
    }
  };

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
          <h3 className="text-sm font-semibold text-sidebar-foreground mb-3 px-2">
            Family Members
          </h3>
          {mounted && (
            <FamilyMemberList
              members={familyMembers}
              selectedId={selectedMemberId}
              onSelect={handleMemberSelect}
              currentUserId={currentUserId}
            />
          )}
        </div>

        {/* Invite Code Section */}
        {familyId && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="bg-sidebar-accent/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Invite Code
              </p>
              <button
                onClick={handleCopyInviteCode}
                className="flex items-center justify-between w-full gap-2 text-sm font-mono bg-background border border-border rounded px-2 py-1.5 hover:bg-accent transition-colors group"
              >
                <span className="truncate">{familyId}</span>
                <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
