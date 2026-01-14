"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Home, Plus, User, Users, Trash2, LogIn, LogOut } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/components/toast";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  familyId: string | null;
  houseId: string | null;
  family: {
    id: string;
    name: string;
  } | null;
  house: {
    id: string;
    name: string;
  } | null;
}

interface House {
  id: string;
  name: string;
  memberCount: number;
}

interface ProfileClientProps {
  user: UserProfile;
  houses: House[];
}

export function ProfileClient({ user, houses: initialHouses }: ProfileClientProps) {
  const router = useRouter();
  const [houses, setHouses] = useState(initialHouses);
  const [currentHouseId, setCurrentHouseId] = useState(user.houseId);
  const [isCreatingHouse, setIsCreatingHouse] = useState(false);
  const [newHouseName, setNewHouseName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseName.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newHouseName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to create house");
      }

      const newHouse = await response.json();
      setHouses([...houses, { id: newHouse.id, name: newHouse.name, memberCount: 0 }]);
      setNewHouseName("");
      setIsCreatingHouse(false);
      showSuccessToast("House created successfully!");
      router.refresh();
    } catch (error) {
      showErrorToast("Failed to create house");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHouse = async (houseId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/houses/${houseId}/join`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to join house");
      }

      setCurrentHouseId(houseId);
      showSuccessToast("Joined house successfully!");
      router.refresh();
    } catch (error) {
      showErrorToast("Failed to join house");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveHouse = async () => {
    if (!currentHouseId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/houses/${currentHouseId}/join`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to leave house");
      }

      setCurrentHouseId(null);
      showSuccessToast("Left house successfully!");
      router.refresh();
    } catch (error) {
      showErrorToast("Failed to leave house");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHouse = async (houseId: string) => {
    if (!confirm("Are you sure you want to delete this house? All members will be removed.")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/houses/${houseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete house");
      }

      setHouses(houses.filter((h) => h.id !== houseId));
      if (currentHouseId === houseId) {
        setCurrentHouseId(null);
      }
      showSuccessToast("House deleted successfully!");
      router.refresh();
    } catch (error) {
      showErrorToast("Failed to delete house");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            {user.family && (
              <p className="text-sm text-muted-foreground mt-1">
                <Users className="inline h-4 w-4 mr-1" />
                Family: {user.family.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Houses Section */}
      {user.familyId && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Houses</h2>
            <button
              onClick={() => setIsCreatingHouse(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              Create House
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Houses help organize family members who live together. You can create multiple houses within your family.
          </p>

          {/* Create House Form */}
          {isCreatingHouse && (
            <form onSubmit={handleCreateHouse} className="mb-6 p-4 bg-muted/50 rounded-lg">
              <label className="block text-sm font-medium mb-2">
                House Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHouseName}
                  onChange={(e) => setNewHouseName(e.target.value)}
                  placeholder="e.g., Main House, Beach House"
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={isLoading || !newHouseName.trim()}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingHouse(false);
                    setNewHouseName("");
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Houses List */}
          {houses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No houses created yet.</p>
              <p className="text-sm">Create a house to organize your family members.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {houses.map((house) => (
                <div
                  key={house.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    currentHouseId === house.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/50"
                  } transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <Home className={`h-5 w-5 ${currentHouseId === house.id ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-medium">{house.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {house.memberCount} {house.memberCount === 1 ? "member" : "members"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentHouseId === house.id ? (
                      <button
                        onClick={handleLeaveHouse}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
                        disabled={isLoading}
                      >
                        <LogOut className="h-4 w-4" />
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinHouse(house.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        disabled={isLoading}
                      >
                        <LogIn className="h-4 w-4" />
                        Join
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteHouse(house.id)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      disabled={isLoading}
                      title="Delete house"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Family Warning */}
      {!user.familyId && (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No Family Yet</h2>
          <p className="text-muted-foreground mb-4">
            You need to join or create a family before you can manage houses.
          </p>
        </div>
      )}
    </div>
  );
}
