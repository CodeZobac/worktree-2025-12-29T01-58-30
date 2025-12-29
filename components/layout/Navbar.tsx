"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ChefHat, LogOut, User, Menu } from "lucide-react";
import Image from "next/image";
import AnimatedList from "@/components/AnimatedList";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile Menu Button - Touch-friendly */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="mr-2 md:hidden p-2 hover:bg-accent active:bg-accent/80 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">Family Recipes</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Profile Dropdown */}
        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent active:bg-accent/80 transition-colors touch-manipulation min-h-[44px]"
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <span className="hidden md:inline text-sm font-medium">
                {session.user.name}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-56 z-50 rounded-lg border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <AnimatedList stagger={0.05} duration={0.2}>
                    <div className="p-1">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent active:bg-accent/80 transition-colors touch-manipulation min-h-[44px]"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </AnimatedList>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
