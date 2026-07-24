"use client";

import * as React from "react";
import { Container, Section, Stack, Surface } from "@/components/ui/layout";
import { LoadingState } from "@/components/ui/loading-state";
import { Icons } from "@/components/shared/icons";

export interface CustomerContentAreaProps {
  state?: "ready" | "loading" | "empty";
}

export function CustomerContentArea({
  state = "empty",
}: CustomerContentAreaProps) {
  if (state === "loading") {
    return (
      <Container className="max-w-3xl py-8">
        <LoadingState
          title="Preparing Digital Menu..."
          description="Fetching category selections and daily chef specials."
        />
      </Container>
    );
  }

  if (state === "empty") {
    return (
      <Container className="max-w-3xl py-8">
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/80 bg-gradient-to-b from-card/60 to-background p-8 text-center shadow-subtle">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Icons.folderOpen className="h-7 w-7" />
          </div>

          <h3 className="font-serif text-xl font-bold tracking-tight text-foreground">
            Digital Culinary Experience Ready
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Our structured menu sections, dish cards, ingredient tags, and table ordering triggers will render dynamically here when menu items are connected in future sprints.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Section className="py-6 px-4 sm:px-6">
      <Container className="max-w-3xl space-y-6">
        <Stack space="4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-serif text-lg font-bold tracking-tight text-foreground">
              Menu Category Section Shell
            </h3>
            <span className="text-xs text-muted-foreground font-medium">Grid Layout Container</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Surface className="border-dashed flex items-center justify-center p-6 text-center text-xs text-muted-foreground rounded-xl">
              Food Item Card Container Slot
            </Surface>
            <Surface className="border-dashed flex items-center justify-center p-6 text-center text-xs text-muted-foreground rounded-xl">
              Food Item Card Container Slot
            </Surface>
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
