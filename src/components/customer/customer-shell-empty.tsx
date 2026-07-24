import * as React from "react";
import { EmptyState, EmptyStateVariant } from "@/components/ui/empty-state";
import { Container } from "@/components/ui/layout";

export interface CustomerShellEmptyProps {
  type?: "no-menu" | "offline" | "unavailable" | "generic";
  onRetry?: () => void;
}

export function CustomerShellEmpty({
  type = "no-menu",
  onRetry,
}: CustomerShellEmptyProps) {
  const configs: Record<
    string,
    { title: string; description: string; variant: EmptyStateVariant }
  > = {
    "no-menu": {
      title: "No Menu Available Yet",
      description: "This restaurant has not published its digital menu items yet. Please check back shortly.",
      variant: "no-data",
    },
    offline: {
      title: "You Are Offline",
      description: "Please check your internet connection and try reloading the menu.",
      variant: "offline",
    },
    unavailable: {
      title: "Restaurant Currently Closed",
      description: "We are not accepting digital table orders right now. Operational hours will resume soon.",
      variant: "error",
    },
    generic: {
      title: "Experience Shell Ready",
      description: "Digital menu structure loaded cleanly.",
      variant: "no-data",
    },
  };

  const config = configs[type] || configs.generic;

  return (
    <Container className="max-w-3xl py-12">
      <EmptyState
        title={config.title}
        description={config.description}
        variant={config.variant}
        actionLabel={onRetry ? "Reload Experience" : undefined}
        onAction={onRetry}
      />
    </Container>
  );
}
