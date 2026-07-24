"use client";

import * as React from "react";
import { CategoryEntity, MenuItemEntity } from "@/types";
import { FoodCard } from "@/components/customer/food-card";
import { FadeIn } from "@/components/shared/motion";

export interface MenuCategorySectionProps {
  category: CategoryEntity;
  dishes: MenuItemEntity[];
  cartItems: Record<string, number>;
  searchQuery?: string;
  onIncrement: (dishId: string) => void;
  onDecrement: (dishId: string) => void;
}

export function MenuCategorySection({
  category,
  dishes,
  cartItems,
  searchQuery = "",
  onIncrement,
  onDecrement,
}: MenuCategorySectionProps) {
  if (dishes.length === 0) return null;

  return (
    <section id={category.id} className="w-full space-y-4 pt-4 scroll-mt-24">
      {/* Category Header */}
      <FadeIn duration={0.3}>
        <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold tracking-tight text-foreground">
              {category.name}
            </h3>
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground border border-primary/20">
              {dishes.length} {dishes.length === 1 ? "Item" : "Items"}
            </span>
          </div>
          {category.description && (
            <p className="text-xs text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
      </FadeIn>

      {/* Responsive Food Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dishes.map((dish) => (
          <FoodCard
            key={dish.id}
            dish={dish}
            quantity={cartItems[dish.id] || 0}
            searchQuery={searchQuery}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        ))}
      </div>
    </section>
  );
}
