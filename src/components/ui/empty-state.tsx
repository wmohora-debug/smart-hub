"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

export type EmptyStateVariant =
  | "no-data"
  | "no-search"
  | "error"
  | "offline"
  | "loading";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  variant?: EmptyStateVariant;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const variantIcons: Record<EmptyStateVariant, React.ReactNode> = {
  "no-data": <Icons.folderOpen className="h-10 w-10 text-muted-foreground" />,
  "no-search": <Icons.search className="h-10 w-10 text-muted-foreground" />,
  error: <Icons.error className="h-10 w-10 text-destructive" />,
  offline: <Icons.wifiOff className="h-10 w-10 text-muted-foreground" />,
  loading: <Icons.spinner className="h-10 w-10 text-primary animate-spin" />,
};

export function EmptyState({
  title,
  description,
  variant = "no-data",
  actionLabel,
  onAction,
  icon,
  className,
  ...props
}: EmptyStateProps) {
  const displayIcon = icon || variantIcons[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
        className,
      )}
      {...props}
    >
      <div className="mb-4 rounded-full bg-muted/50 p-4">{displayIcon}</div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
