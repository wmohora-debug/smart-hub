"use client";

import * as React from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

export interface AdminShellProps {
  children: React.ReactNode;
  userEmail?: string;
  userRole?: string;
  restaurantName?: string;
  onLogout?: () => void;
}

export function AdminShell({
  children,
  userEmail,
  userRole,
  restaurantName,
  onLogout,
}: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* Persistent Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <AdminHeader
          userEmail={userEmail}
          userRole={userRole}
          restaurantName={restaurantName}
          onLogout={onLogout}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
