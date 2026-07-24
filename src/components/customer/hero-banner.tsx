"use client";

import * as React from "react";
import { FadeIn, ScaleIn } from "@/components/shared/motion";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import { RestaurantEntity } from "@/types";

export interface HeroBannerProps {
  restaurant?: RestaurantEntity | null;
}

export function HeroBanner({ restaurant }: HeroBannerProps) {
  const headline =
    restaurant?.metaTitle ||
    (restaurant?.name ? `${restaurant.name} — ${restaurant.tagline || "Culinary Bistro"}` : undefined) ||
    "Artisanal Dining & Seasoned Gastronomy";

  const description =
    restaurant?.metaDescription ||
    restaurant?.description ||
    "Explore our hand-crafted menu prepared by master chefs using organic, locally sourced ingredients. Select your table favorites below.";

  const prepTime = restaurant?.prepTime || "15-20 min";
  const deliveryTime = restaurant?.deliveryTime || "30-45 min";

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20 border-b py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <FadeIn duration={0.5}>
          <div className="relative z-10 flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 text-primary text-[11px] px-3 py-0.5 font-semibold tracking-wider uppercase rounded-full"
              >
                Culinary Excellence • {restaurant?.name || "Smart Menu"}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground leading-tight">
              {headline}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              {description}
            </p>

            {/* Ambient Highlights & Cover Features */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Icons.checkCircle className="h-4 w-4 text-primary" />
                <span>Prep: {prepTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icons.checkCircle className="h-4 w-4 text-primary" />
                <span>Est. Time: {deliveryTime}</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Ambient Culinary Light Glow */}
        <ScaleIn className="absolute -right-8 -bottom-10 opacity-20 pointer-events-none">
          <div className="h-56 w-56 rounded-full bg-primary/40 blur-3xl" />
        </ScaleIn>
      </div>
    </div>
  );
}
