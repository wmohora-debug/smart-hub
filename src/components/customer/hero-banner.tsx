"use client";

import * as React from "react";
import Image from "next/image";
import { FadeIn } from "@/components/shared/motion";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import { SearchSection } from "@/components/customer/search-section";
import { RestaurantEntity } from "@/types";

export interface HeroBannerProps {
  restaurant?: RestaurantEntity | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function HeroBanner({
  restaurant,
  searchQuery = "",
  onSearchChange,
}: HeroBannerProps) {
  const displayName = restaurant?.name || "Smart Tech Food Hub";
  const displayTagline =
    restaurant?.tagline ||
    "Freshly prepared fast food, snacks, and refreshing drinks";
  const displayLocation =
    restaurant?.address ||
    [restaurant?.city, restaurant?.state, restaurant?.postalCode].filter(Boolean).join(", ") ||
    "Namchi, Sikkim";

  const isCurrentlyOpen = restaurant?.isOverrideClosed
    ? false
    : restaurant?.isActive ?? true;

  const prepTime = restaurant?.prepTime || "15-20 min";
  const deliveryTime = restaurant?.deliveryTime || "30-45 min";
  const bannerUrl = restaurant?.banner;

  // Extract initials (e.g., "Smart Tech Food Hub" -> "ST")
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative w-full overflow-visible">
      {/* FULL WIDTH RESPONSIVE HERO BOX */}
      <div className="relative w-full min-h-[220px] sm:min-h-[280px] md:min-h-[340px] flex flex-col justify-between overflow-hidden bg-slate-950 text-white border-b border-border/40 pb-8 pt-4 px-4 sm:px-6 md:px-8">
        {/* Background Image when restaurant.banner is present */}
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={displayName}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            className="object-cover object-center z-0"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-zinc-900 to-black z-0" />
        )}

        {/* Multi-layer Overlays for Maximum Contrast */}
        <div className="absolute inset-0 bg-black/45 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35 z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent z-[3]" />

        {/* HERO INNER CONTENT */}
        <div className="relative z-10 mx-auto max-w-3xl w-full flex flex-col justify-between h-full space-y-4 sm:space-y-6">
          <FadeIn duration={0.4}>
            {/* TOP ROW: Restaurant Identity & Open/Closed Status */}
            <div className="flex items-center justify-between gap-3">
              {/* Logo & Name */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-black/60 shadow-lg shadow-black/40 overflow-hidden backdrop-blur-md">
                  {restaurant?.logo ? (
                    <Image
                      src={restaurant.logo}
                      alt={displayName}
                      fill
                      sizes="(max-width: 640px) 48px, 64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-serif text-base sm:text-lg md:text-2xl font-bold tracking-tighter text-white">
                      {initials}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-serif font-bold tracking-tight text-white drop-shadow-md">
                      Smart Tech Food Hub
                    </h1>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-medium shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isCurrentlyOpen ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            isCurrentlyOpen ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                      </span>
                      <span>{isCurrentlyOpen ? "Open Now" : "Closed"}</span>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs md:text-sm text-white/80 font-medium max-w-md line-clamp-1 sm:line-clamp-none mt-0.5">
                    {displayTagline}
                  </p>
                </div>
              </div>
            </div>

            {/* SECOND ROW: Metadata Badges (Rating, Location) */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[11px] sm:text-xs font-medium">
                <span className="text-amber-400">★</span>
                <span>4.9 (240+ Reviews)</span>
              </div>
              {displayLocation && (
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[11px] sm:text-xs font-normal">
                  <Icons.folderOpen className="h-3.5 w-3.5 text-white/70" />
                  <span className="truncate max-w-[180px] sm:max-w-none">{displayLocation}</span>
                </div>
              )}
            </div>

            {/* CENTER CONTENT: Headline, Description & Prep Time */}
            <div className="mt-3 sm:mt-4 pt-3 border-t border-white/15 space-y-2">
              <Badge
                variant="outline"
                className="border-white/30 bg-black/40 text-white text-[10px] sm:text-[11px] px-2.5 py-0.5 font-semibold tracking-wider uppercase rounded-full backdrop-blur-md"
              >
                Fresh & Delicious
              </Badge>

              <h2 className="text-base sm:text-xl md:text-2xl font-serif font-bold text-white tracking-tight leading-tight">
                Smart Tech Food Hub
              </h2>

              <p className="text-xs sm:text-sm text-white/85 max-w-xl leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
                Enjoy freshly prepared fast food, snacks, and refreshing drinks made with quality ingredients.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] sm:text-xs font-medium text-white/90">
                <div className="flex items-center gap-1.5">
                  <Icons.checkCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                  <span>Prep: {prepTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.checkCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                  <span>Est. Time: {deliveryTime}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* FLOATING SEARCH BAR AT BOTTOM OF HERO */}
      {onSearchChange && (
        <div id="search-section" className="mx-auto max-w-3xl px-4 sm:px-6 -mt-6 relative z-20">
          <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl p-2 sm:p-3">
            <SearchSection value={searchQuery} onChange={onSearchChange} />
          </div>
        </div>
      )}
    </div>
  );
}
