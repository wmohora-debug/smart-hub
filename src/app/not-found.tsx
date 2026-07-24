"use client";

import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <EmptyState
        title="404 - Page Not Found"
        description="The requested page or resource could not be found."
        variant="no-data"
      />
    </div>
  );
}
