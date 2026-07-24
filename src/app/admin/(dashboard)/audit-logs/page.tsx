"use client";

import * as React from "react";
import { Container } from "@/components/ui/layout";
import { EmptyState } from "@/components/ui/empty-state";

export default function AuditLogsAdminPage() {
  return (
    <Container className="py-8">
      <EmptyState
        title="Audit Logs Module Coming Soon"
        description="System activity logging, staff login records, and menu edit history will be built in Sprint 10."
      />
    </Container>
  );
}
