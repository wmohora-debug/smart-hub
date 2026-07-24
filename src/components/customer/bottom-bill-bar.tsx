"use client";

import * as React from "react";
import { SlideIn } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/components/ui/toast-wrapper";
import { cn } from "@/lib/utils";

export interface BottomBillBarProps {
  itemCount: number;
  estimatedTotal: number;
}

export function BottomBillBar({
  itemCount,
  estimatedTotal,
}: BottomBillBarProps) {
  const isEnabled = itemCount > 0;
  const prevCount = React.useRef(itemCount);
  const [justAdded, setJustAdded] = React.useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (itemCount > prevCount.current) {
      setJustAdded(true);
      timer = setTimeout(() => setJustAdded(false), 600);
    }
    prevCount.current = itemCount;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [itemCount]);

  return (
    <SlideIn
      direction="up"
      duration={0.3}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 w-full border-t border-border/60 bg-background/85 backdrop-blur-2xl shadow-elevated pb-[env(safe-area-inset-bottom)] transition-opacity duration-200",
        !isEnabled && "opacity-90",
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Bill Summary */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-subtle transition-transform duration-200",
              justAdded && "scale-110 bg-primary/20",
            )}
          >
            <Icons.folderOpen className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className={cn(
                  "absolute -top-1.5 -right-1.5 h-5 min-w-[20px] justify-center px-1 text-[10px] shadow-sm transition-transform",
                  justAdded && "scale-125 bg-primary text-primary-foreground",
                )}
              >
                {itemCount}
              </Badge>
            )}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Estimated Total
            </div>
            <div className="text-base sm:text-lg font-bold tracking-tight text-foreground transition-all">
              ₹{estimatedTotal.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* View Bill Action Button */}
        <Button
          variant="primary"
          size="md"
          disabled={!isEnabled}
          className={cn(
            "rounded-full px-6 font-semibold shadow-md shadow-primary/25 gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100",
            justAdded && "animate-pulse-subtle scale-105",
          )}
          onClick={() =>
            notify.success(
              `Table Order Summary: ${itemCount} items, ₹${estimatedTotal.toLocaleString("en-IN")}`,
            )
          }
        >
          <span>View Table Order</span>
          <Icons.chevronRight className="h-4 w-4" />
        </Button>
      </div>
    </SlideIn>
  );
}
