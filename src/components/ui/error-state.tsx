import * as React from "react";
import { EmptyState } from "@/components/ui/empty-state";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred while loading data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      actionLabel={onRetry ? "Try Again" : undefined}
      onAction={onRetry}
      className={className}
    />
  );
}
