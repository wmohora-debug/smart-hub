"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "./admin-shell";
import { notify } from "@/components/ui/toast-wrapper";

export interface AdminShellWrapperProps {
  children: React.ReactNode;
  userEmail?: string;
  userRole?: string;
}

export function AdminShellWrapper({
  children,
  userEmail,
  userRole,
}: AdminShellWrapperProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      notify.info("Logged out of admin session.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      notify.error("Failed to log out.");
    }
  };

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      onLogout={handleLogout}
    >
      {children}
    </AdminShell>
  );
}
