import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

const spinnerVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<SVGElement>,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ size, className, ...props }: SpinnerProps) {
  return (
    <Icons.spinner
      className={cn(spinnerVariants({ size, className }))}
      {...props}
    />
  );
}
