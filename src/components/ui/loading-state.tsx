import * as React from "react";
import { EmptyState } from "@/components/ui/empty-state";

export interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingState({
  title = "Loading data...",
  description = "Please wait while we prepare the content.",
  className,
}: LoadingStateProps) {
  return (
    <EmptyState
      variant="loading"
      title={title}
      description={description}
      className={className}
    />
  );
}
