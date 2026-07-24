"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";

export interface NavItem {
  title: string;
  href: string;
  icon: keyof typeof Icons;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: "folderOpen" },
  { title: "Restaurant", href: "/admin/restaurant", icon: "info" },
  { title: "Categories", href: "/admin/categories", icon: "folderOpen" },
  { title: "Menu Items", href: "/admin/menu-items", icon: "plus" },
  { title: "Tables & QR", href: "/admin/tables", icon: "copy" },
  { title: "Media Library", href: "/admin/media", icon: "copy" },
  { title: "Settings", href: "/admin/settings", icon: "info", comingSoon: true },
  { title: "Audit Logs", href: "/admin/audit-logs", icon: "checkCircle", comingSoon: true },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-card/80 backdrop-blur-xl min-h-screen">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 font-serif font-bold text-lg">
          ST
        </div>
        <div>
          <h2 className="font-serif text-sm font-bold text-foreground tracking-tight">
            Smart Menu
          </h2>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const IconComponent = Icons[item.icon] || Icons.folderOpen;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-3">
                <IconComponent className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </div>
              {item.comingSoon && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1.5 py-0 font-normal border-border/60",
                    isActive ? "border-primary-foreground/30 text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  Soon
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Role Banner */}
      <div className="border-t p-4 bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Enterprise v1.0</span>
          <Badge variant="secondary" className="text-[10px] py-0 px-2 font-mono">
            Pro
          </Badge>
        </div>
      </div>
    </aside>
  );
}
