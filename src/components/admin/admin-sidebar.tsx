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
  { title: "Orders", href: "/admin/orders", icon: "folderOpen" },
  { title: "Restaurant", href: "/admin/restaurant", icon: "info" },
  { title: "Categories", href: "/admin/categories", icon: "folderOpen" },
  { title: "Menu Items", href: "/admin/menu-items", icon: "plus" },
  { title: "Tables & QR", href: "/admin/tables", icon: "copy" },
  { title: "Media Library", href: "/admin/media", icon: "copy" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [unreadOrdersCount, setUnreadOrdersCount] = React.useState(0);

  // Poll pending orders for new notification badge
  const fetchPendingOrders = React.useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const res = await fetch("/api/v1/orders?status=PENDING&limit=50");
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const pendingOrders = data.data;
        const lastViewedTimeStr = localStorage.getItem("last_viewed_orders_time");
        const lastViewedTime = lastViewedTimeStr ? parseInt(lastViewedTimeStr, 10) : 0;

        // If currently on orders page, mark all viewed
        if (pathname === "/admin/orders") {
          localStorage.setItem("last_viewed_orders_time", Date.now().toString());
          setUnreadOrdersCount(0);
        } else {
          // Count pending orders created after last viewed timestamp
          const newOrders = pendingOrders.filter(
            (o: { createdAt: string }) => new Date(o.createdAt).getTime() > lastViewedTime,
          );
          setUnreadOrdersCount(newOrders.length);
        }
      }
    } catch {
      // Ignore background fetch errors
    }
  }, [pathname]);

  React.useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchPendingOrders]);

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
          const isOrders = item.href === "/admin/orders";

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

              {/* Order Notification Badge */}
              {isOrders && unreadOrdersCount > 0 && (
                <Badge
                  variant="destructive"
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 font-bold animate-pulse shadow-sm",
                    isActive && "bg-white text-destructive font-black border-none",
                  )}
                >
                  {unreadOrdersCount} NEW
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
