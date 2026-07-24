import * as React from "react";
import { Spinner } from "@/components/ui/spinner";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="xl" />
        <span className="text-sm font-medium text-muted-foreground">
          Loading platform...
        </span>
      </div>
    </div>
  );
}
