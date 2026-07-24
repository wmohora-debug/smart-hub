import * as React from "react";
import { getSession } from "@/lib/auth/session";
import { AdminShellWrapper } from "@/components/admin/admin-shell-wrapper";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AdminShellWrapper
      userEmail={session?.email ?? "admin@legourmet.com"}
      userRole={session?.role ?? "RESTAURANT_OWNER"}
    >
      {children}
    </AdminShellWrapper>
  );
}
