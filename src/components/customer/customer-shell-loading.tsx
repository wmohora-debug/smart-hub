import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Container, Stack } from "@/components/ui/layout";

export function CustomerShellLoading() {
  return (
    <div className="w-full min-h-screen bg-background space-y-4 pb-24">
      {/* Header Skeleton */}
      <div className="w-full border-b p-4 sm:p-6">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-60" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="w-full py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-3">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Search Skeleton */}
      <div className="w-full px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="w-full px-4 sm:px-6">
        <div className="mx-auto max-w-3xl flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton Cards */}
      <Container className="max-w-3xl py-6">
        <Stack space="4">
          <Skeleton className="h-6 w-44" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </Stack>
      </Container>
    </div>
  );
}
