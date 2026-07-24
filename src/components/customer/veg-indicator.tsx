import * as React from "react";
import { cn } from "@/lib/utils";

export interface VegIndicatorProps {
  isVeg: boolean;
  className?: string;
}

export function VegIndicator({ isVeg, className }: VegIndicatorProps) {
  return (
    <div
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center border-2 p-0.5 rounded-sm",
        isVeg ? "border-success" : "border-destructive",
        className,
      )}
      title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
    >
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          isVeg ? "bg-success" : "bg-destructive",
        )}
      />
    </div>
  );
}
