"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Icons } from "@/components/shared/icons";
import { Heading, Muted } from "@/components/ui/typography";
import { notify } from "@/components/ui/toast-wrapper";
import { RestaurantEntity } from "@/types";

export interface RestaurantHeaderProps {
  restaurant?: RestaurantEntity | null;
  name?: string;
  tagline?: string;
  isOpen?: boolean;
  rating?: string;
  location?: string;
}

export function RestaurantHeader({
  restaurant,
  name,
  tagline,
  isOpen,
  rating = "4.9 ★ (240+ Reviews)",
  location,
}: RestaurantHeaderProps) {
  const displayName = restaurant?.name || name || "Smart Food Hub";
  const displayTagline =
    restaurant?.tagline ||
    tagline ||
    restaurant?.description ||
    "Premium Artisanal Digital Menu & Culinary Bistro";
  const displayLocation =
    restaurant?.address ||
    location ||
    [restaurant?.city, restaurant?.state, restaurant?.postalCode].filter(Boolean).join(", ") ||
    "Namchi, Sikkim";

  const isCurrentlyOpen =
    isOpen !== undefined
      ? isOpen
      : restaurant?.isOverrideClosed
      ? false
      : restaurant?.isActive ?? true;

  // Extract initials (e.g., "Smart Food Hub" -> "SF")
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="w-full bg-card/60 backdrop-blur-md border-b py-5 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/20 via-card to-accent shadow-subtle ring-4 ring-primary/5 overflow-hidden">
              {restaurant?.logo && restaurant.logo.startsWith("/") ? (
                <span className="font-serif text-2xl font-bold tracking-tighter text-primary">
                  {initials}
                </span>
              ) : restaurant?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={restaurant.logo}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-serif text-2xl font-bold tracking-tighter text-primary">
                  {initials}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <Heading level="h4" className="text-xl font-serif font-bold tracking-tight text-foreground">
                  {displayName}
                </Heading>
                <StatusIndicator
                  status={isCurrentlyOpen ? "online" : "offline"}
                  label={isCurrentlyOpen ? "Open Now" : "Closed"}
                />
              </div>
              <Muted className="text-xs text-muted-foreground mt-0.5 font-medium">
                {displayTagline}
              </Muted>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/50 shadow-subtle"
              title="Share Menu"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
                notify.info("Menu link copied to clipboard");
              }}
            >
              <Icons.copy className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-border/80 text-muted-foreground hover:text-destructive hover:border-destructive/50 shadow-subtle"
              title="Save Favorite"
              onClick={() => notify.success("Added to favorites")}
            >
              <Icons.checkCircle className="h-4 w-4" />
              <span className="sr-only">Favorite</span>
            </Button>
          </div>
        </div>

        {/* Metadata Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
          <Badge variant="secondary" className="gap-1.5 font-medium py-1 px-3 bg-accent/60 text-accent-foreground border border-primary/20">
            <Icons.info className="h-3.5 w-3.5 text-primary" />
            {rating}
          </Badge>
          {displayLocation && (
            <Badge variant="outline" className="gap-1.5 font-normal py-1 px-3 border-border/80 text-muted-foreground">
              <Icons.folderOpen className="h-3.5 w-3.5 text-muted-foreground" />
              {displayLocation}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
