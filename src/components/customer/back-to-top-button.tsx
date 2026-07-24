"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { SlideIn } from "@/components/shared/motion";

export function BackToTopButton() {
  const { showBackToTop, scrollToTop } = useScrollProgress();

  if (!showBackToTop) return null;

  return (
    <SlideIn
      direction="up"
      duration={0.25}
      className="fixed bottom-20 right-4 z-40"
    >
      <Button
        variant="primary"
        size="icon"
        onClick={scrollToTop}
        className="h-11 w-11 rounded-full shadow-elevated border border-primary-foreground/20 hover:scale-110 active:scale-95 transition-transform"
        aria-label="Back to top"
        title="Scroll to top"
      >
        <Icons.chevronUp className="h-5 w-5 text-primary-foreground" />
      </Button>
    </SlideIn>
  );
}
