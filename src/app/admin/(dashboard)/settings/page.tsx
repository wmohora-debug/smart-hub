"use client";

import * as React from "react";
import { Container } from "@/components/ui/layout";
import { EmptyState } from "@/components/ui/empty-state";

export default function SettingsAdminPage() {
  return (
    <Container className="py-8">
      <EmptyState
        title="Admin Settings Module Coming Soon"
        description="Tax rate configuration, service charge adjustments, and currency formatting will be built in Sprint 10."
      />
    </Container>
  );
}
