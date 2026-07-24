"use client";

import * as React from "react";
import Image from "next/image";
import { MenuItemEntity } from "@/types";
import { VegIndicator } from "@/components/customer/veg-indicator";
import { HighlightText } from "@/components/customer/highlight-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import { cn } from "@/lib/utils";

export interface FoodCardProps {
  dish: MenuItemEntity;
  quantity?: number;
  searchQuery?: string;
  onIncrement?: (dishId: string) => void;
  onDecrement?: (dishId: string) => void;
}

export function FoodCard({
  dish,
  quantity = 0,
  searchQuery = "",
  onIncrement,
  onDecrement,
}: FoodCardProps) {
  const {
    id,
    name,
    description,
    price,
    image,
    isVeg,
    isPopular,
    isChefSpecial,
    isSoldOut,
  } = dish;

  const [imageError, setImageError] = React.useState(false);

  return (
    <Card
      variant="default"
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-card hover:border-primary/50 active:scale-[0.99] rounded-xl border-border/70",
        isSoldOut && "opacity-60 bg-muted/40 border-dashed pointer-events-none hover:translate-y-0",
      )}
    >
      {/* Food Image Frame */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-muted via-accent/20 to-secondary/50">
        {image && !imageError ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Placeholder Icon */
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 group-hover:scale-105 transition-transform duration-300">
            <Icons.folderOpen className="h-10 w-10" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10">
          <VegIndicator isVeg={isVeg} className="bg-background/90 shadow-sm" />
          {isPopular && (
            <Badge variant="default" className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 font-bold shadow-sm animate-fade-in">
              Popular
            </Badge>
          )}
          {isChefSpecial && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground border border-primary/30 text-[10px] px-2 py-0.5 font-bold shadow-sm animate-fade-in">
              Chef Special
            </Badge>
          )}
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-xs">
            <Badge variant="destructive" className="px-3 py-1 font-extrabold tracking-wider uppercase text-xs shadow-md">
              Sold Out
            </Badge>
          </div>
        )}
      </div>

      {/* Content Info */}
      <CardContent className="flex flex-col flex-1 justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-serif font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
              <HighlightText text={name} query={searchQuery} />
            </h4>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Price & Quantity Controls Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="font-sans text-base font-bold text-foreground">
            ₹{Number(price)}
          </div>

          {!isSoldOut && (
            <div className="relative">
              {quantity > 0 ? (
                <div className="flex items-center rounded-full border border-primary/50 bg-accent/80 p-0.5 shadow-sm transition-all animate-scale-in">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-foreground hover:bg-background active:scale-90"
                    onClick={() => onDecrement?.(id)}
                    aria-label={`Decrease quantity of ${name}`}
                  >
                    <span className="text-sm font-extrabold">-</span>
                  </Button>
                  <span className="w-7 text-center text-xs font-bold text-foreground">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-foreground hover:bg-background active:scale-90"
                    onClick={() => onIncrement?.(id)}
                    aria-label={`Increase quantity of ${name}`}
                  >
                    <Icons.plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 h-8 text-xs font-bold text-primary border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-subtle active:scale-95 transition-all"
                  onClick={() => onIncrement?.(id)}
                  aria-label={`Add ${name} to table order`}
                >
                  ADD +
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
