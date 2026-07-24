"use client";

import * as React from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <ErrorState
        title="Application Error"
        description="A critical error occurred while loading this view."
        onRetry={reset}
      />
    </div>
  );
}
