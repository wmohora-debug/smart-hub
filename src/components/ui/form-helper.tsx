import * as React from "react";
import { cn } from "@/lib/utils";

export interface HelperTextProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function HelperText({ className, children, ...props }: HelperTextProps) {
  if (!children) return null;
  return (
    <p
      className={cn("text-xs text-muted-foreground mt-1.5", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function ErrorText({ className, children, ...props }: HelperTextProps) {
  if (!children) return null;
  return (
    <p
      className={cn("text-xs font-medium text-destructive mt-1.5", className)}
      {...props}
    >
      {children}
    </p>
  );
}
