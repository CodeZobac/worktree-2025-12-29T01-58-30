"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface FamilyMember {
  id: string;
  name: string;
  image?: string;
  recipeCount: number;
  houseId?: string;
  houseName?: string;
}

interface House {
  id: string;
  name: string;
}

interface MainLayoutClientProps {
  children: React.ReactNode;
  familyMembers: FamilyMember[];
  currentUserId: string;
  familyId?: string;
  houses?: House[];
  currentHouseId?: string;
}

export function MainLayoutClient({
  children,
  familyMembers,
  currentUserId,
  familyId,
  houses = [],
  currentHouseId,
}: MainLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onMenuClick={() => setIsMobileSidebarOpen(true)} 
        familyId={familyId}
        houses={houses}
        currentHouseId={currentHouseId}
      />
      <div className="flex flex-1">
        <Sidebar
          familyMembers={familyMembers}
          currentUserId={currentUserId}
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          houses={houses}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
