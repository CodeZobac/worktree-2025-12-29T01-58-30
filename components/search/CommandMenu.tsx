"use client";

import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  ChefHat,
  FolderOpen,
  Calendar,
  Users,
  Home,
  X,
  Loader2,
} from "lucide-react";

interface SearchResult {
  recipes: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    author: string | null;
  }[];
  folders: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string;
    recipeCount: number;
  }[];
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ recipes: [], folders: [] });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Toggle with keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ recipes: [], folders: [] });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Search error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSelect = useCallback(
    (value: string) => {
      setOpen(false);
      setQuery("");
      router.push(value);
    },
    [router]
  );

  const hasResults = results.recipes.length > 0 || results.folders.length > 0;

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors border border-border bg-background/50"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content
            className="fixed left-1/2 top-[20%] z-[100] -translate-x-1/2 w-full max-w-xl animate-in fade-in slide-in-from-top-4 duration-200"
            aria-describedby={undefined}
          >
            <VisuallyHidden.Root asChild>
              <Dialog.Title>Search recipes and folders</Dialog.Title>
            </VisuallyHidden.Root>
            <Command className="mx-4 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl" shouldFilter={false}>
              {/* Input */}
              <div className="flex items-center border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search recipes, folders..."
                className="flex-1 h-14 bg-transparent px-4 text-base outline-none placeholder:text-muted-foreground"
              />
              {isLoading && (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
              )}
              <button
                onClick={() => setOpen(false)}
                className="ml-2 p-1 rounded hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* List */}
            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                {query.length < 2
                  ? "Type to search..."
                  : "No results found."}
              </Command.Empty>

              {/* Quick Actions */}
              {!query && (
                <Command.Group heading="Quick Actions">
                  <Command.Item
                    value="/recipes"
                    onSelect={handleSelect}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-accent transition-colors"
                  >
                    <ChefHat className="h-4 w-4 text-primary" />
                    <span>Browse Recipes</span>
                  </Command.Item>
                  <Command.Item
                    value="/calendar"
                    onSelect={handleSelect}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-accent transition-colors"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Meal Calendar</span>
                  </Command.Item>
                  <Command.Item
                    value="/family"
                    onSelect={handleSelect}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-accent transition-colors"
                  >
                    <Users className="h-4 w-4 text-primary" />
                    <span>Family Settings</span>
                  </Command.Item>
                  <Command.Item
                    value="/"
                    onSelect={handleSelect}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-accent transition-colors"
                  >
                    <Home className="h-4 w-4 text-primary" />
                    <span>Home</span>
                  </Command.Item>
                </Command.Group>
              )}

              {/* Recipe Results */}
              {hasResults && results.recipes.length > 0 && (
                <Command.Group heading="Recipes">
                  {results.recipes.map((recipe) => (
                    <Command.Item
                      key={recipe.id}
                      value={`/recipes/${recipe.id}`}
                      onSelect={handleSelect}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-accent transition-colors"
                    >
                      <ChefHat className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{recipe.name}</div>
                        {recipe.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {recipe.description}
                          </div>
                        )}
                      </div>
                      {recipe.author && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          by {recipe.author}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Folder Results */}
              {hasResults && results.folders.length > 0 && (
                <Command.Group heading="Folders">
                  {results.folders.map((folder) => (
                    <Command.Item
                      key={folder.id}
                      value={`/recipes?folderId=${folder.id}`}
                      onSelect={handleSelect}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-accent transition-colors"
                    >
                      <FolderOpen
                        className="h-4 w-4 shrink-0"
                        style={{ color: folder.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{folder.name}</div>
                        {folder.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {folder.description}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {folder.recipeCount} recipe{folder.recipeCount !== 1 ? "s" : ""}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↵</kbd>
                  Select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">Esc</kbd>
                Close
              </span>
            </div>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
