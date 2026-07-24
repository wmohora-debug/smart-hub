import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusVariants = cva("h-2.5 w-2.5 rounded-full inline-block shrink-0", {
  variants: {
    status: {
      online: "bg-success animate-pulse",
      offline: "bg-muted-foreground",
      pending: "bg-warning animate-pulse",
      busy: "bg-destructive",
    },
  },
  defaultVariants: {
    status: "online",
  },
});

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
  label?: string;
}

export function StatusIndicator({
  status,
  label,
  className,
  ...props
}: StatusIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium" {...props}>
      <span className={cn(statusVariants({ status, className }))} />
      {label && <span>{label}</span>}
    </span>
  );
}
