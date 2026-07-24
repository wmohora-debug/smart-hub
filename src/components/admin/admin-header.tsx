"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/components/ui/toast-wrapper";

export interface AdminHeaderProps {
  userEmail?: string;
  userRole?: string;
  restaurantName?: string;
  onLogout?: () => void;
}

export function AdminHeader({
  userEmail = "admin@legourmet.com",
  userRole = "RESTAURANT_OWNER",
  restaurantName = "Le Gourmet Bistro",
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card/80 backdrop-blur-xl px-4 sm:px-6 shadow-subtle">
      {/* Left Breadcrumb & Restaurant Switcher Placeholder */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 font-medium py-1 px-2.5 bg-background border-border/80">
            <Icons.info className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground text-xs">{restaurantName}</span>
          </Badge>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Trigger Placeholder */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground border-border/80"
          onClick={() => notify.info("No unread system notifications")}
          title="Notifications"
        >
          <Icons.info className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Profile Pill & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-foreground line-clamp-1">{userEmail}</span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{userRole}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="rounded-full px-3 h-8 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
