import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function InlineLoader({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Spinner size="sm" />
      <span>{label}</span>
    </div>
  );
}
