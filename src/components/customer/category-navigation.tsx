"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CategoryEntity } from "@/types";

export interface CategoryNavigationProps {
  categories: CategoryEntity[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  getCategoryItemCount: (categoryId: string) => number;
}

export function CategoryNavigation({
  categories,
  activeCategory,
  onSelectCategory,
  getCategoryItemCount,
}: CategoryNavigationProps) {
  const navRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll active chip into view inside the horizontal nav container
  React.useEffect(() => {
    if (!navRef.current) return;
    const activeChip = navRef.current.querySelector<HTMLElement>(
      `[data-category-chip="${activeCategory}"]`,
    );
    if (activeChip) {
      activeChip.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-16 z-20 w-full border-b border-border/50 bg-card/90 backdrop-blur-md py-2.5 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <nav
          ref={navRef}
          aria-label="Category Navigation"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        >
          {/* All Selection Chip */}
          <button
            type="button"
            data-category-chip="all"
            aria-current={activeCategory === "all" ? "true" : undefined}
            onClick={() => onSelectCategory("all")}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                : "bg-secondary/70 text-secondary-foreground hover:bg-secondary hover:text-foreground border border-border/40",
            )}
          >
            <span>All Selection</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight",
                activeCategory === "all"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background/80 text-muted-foreground border border-border/40",
              )}
            >
              {getCategoryItemCount("all")}
            </span>
          </button>

          {/* Category Chips */}
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = getCategoryItemCount(cat.id);

            return (
              <button
                key={cat.id}
                type="button"
                data-category-chip={cat.id}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelectCategory(cat.id)}
                className={cn(
                  "relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-secondary/70 text-secondary-foreground hover:bg-secondary hover:text-foreground border border-border/40",
                )}
              >
                <span>{cat.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background/80 text-muted-foreground border border-border/40",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
