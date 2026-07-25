import * as React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AdminShellWrapper } from "@/components/admin/admin-shell-wrapper";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminShellWrapper
      userEmail={session.email}
      userRole={session.role}
    >
      {children}
    </AdminShellWrapper>
  );
}
