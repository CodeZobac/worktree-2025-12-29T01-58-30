"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, User, Menu, Copy, Home, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AnimatedList from "@/components/AnimatedList";
import { showSuccessToast } from "@/components/toast";
import { CommandMenu } from "@/components/search";

interface House {
  id: string;
  name: string;
}

interface NavbarProps {
  onMenuClick?: () => void;
  familyId?: string;
  houses?: House[];
  currentHouseId?: string;
}

export function Navbar({ onMenuClick, familyId, houses = [], currentHouseId }: NavbarProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleCopyInviteCode = () => {
    if (familyId) {
      navigator.clipboard.writeText(familyId);
      showSuccessToast("Invite code copied to clipboard!");
      setIsDropdownOpen(false);
    }
  };

  const currentHouse = houses.find(h => h.id === currentHouseId);

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

        {/* Logo - Clickable to home */}
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/logo.svg"
            alt="Family Recipes"
            width={180}
            height={60}
            className="w-48 object-contain"
            priority
          />
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <CommandMenu />

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
                <div className="absolute right-0 mt-2 w-64 z-50 rounded-lg border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info */}
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>

                  <AnimatedList stagger={0.05} duration={0.2}>
                    {/* Invite Code Section */}
                    {familyId && (
                      <div className="p-2 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
                          Invite Code
                        </p>
                        <button
                          onClick={handleCopyInviteCode}
                          className="flex items-center justify-between w-full gap-2 text-sm font-mono bg-background border border-border rounded-md px-3 py-2 hover:bg-accent transition-colors group"
                        >
                          <span className="truncate">{familyId}</span>
                          <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        </button>
                      </div>
                    )}

                    {/* Houses Section */}
                    {houses.length > 0 && (
                      <div className="p-2 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
                          Houses
                        </p>
                        <div className="space-y-1">
                          {houses.map((house) => (
                            <Link
                              key={house.id}
                              href={`/profile/houses/${house.id}`}
                              onClick={() => setIsDropdownOpen(false)}
                              className={`flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors ${
                                house.id === currentHouseId ? 'bg-accent' : ''
                              }`}
                            >
                              <Home className="h-4 w-4" />
                              <span className="truncate">{house.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Profile & Settings */}
                    <div className="p-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent active:bg-accent/80 transition-colors touch-manipulation min-h-[44px]"
                      >
                        <Settings className="h-4 w-4" />
                        Manage Profile & Houses
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent active:bg-accent/80 transition-colors touch-manipulation min-h-[44px] text-destructive"
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
