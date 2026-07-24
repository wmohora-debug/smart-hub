"use client";

import * as React from "react";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

export function ScrollProgressBar() {
  const { scrollProgress } = useScrollProgress();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 w-full bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary via-accent-foreground to-primary transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
