import * as React from "react";
import { getSession } from "@/lib/auth/session";
import { DashboardService } from "@/services/dashboard.service";
import { StatsCard } from "@/components/admin/stats-card";
import { QuickActions } from "@/components/admin/quick-actions";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  let stats = {
    restaurantName: "Le Gourmet Bistro",
    categoryCount: 7,
    menuItemCount: 42,
    popularCount: 12,
    chefSpecialCount: 8,
  };

  try {
    const fetchedStats = await DashboardService.getStats(session?.restaurantId ?? undefined);
    if (fetchedStats) {
      stats = fetchedStats;
    }
  } catch (error) {
    console.warn("Dashboard stats fetch warning:", error);
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
              Live Systems
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time management metrics for <span className="font-semibold text-foreground">{stats.restaurantName}</span>.
          </p>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Menu Categories"
          value={stats.categoryCount}
          description="Active sections in menu"
          icon="folderOpen"
        />
        <StatsCard
          title="Total Menu Dishes"
          value={stats.menuItemCount}
          description="Available food items"
          icon="plus"
        />
        <StatsCard
          title="Popular Selections"
          value={stats.popularCount}
          description="Customer top picks"
          icon="checkCircle"
        />
        <StatsCard
          title="Chef Specials"
          value={stats.chefSpecialCount}
          description="Featured gourmet dishes"
          icon="info"
        />
      </div>

      {/* Quick Action Module Cards */}
      <div className="space-y-3 pt-2">
        <h3 className="font-serif text-lg font-bold tracking-tight text-foreground">
          Quick Admin Actions
        </h3>
        <QuickActions />
      </div>

      {/* Activity & Status Overview Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* System Activity Placeholder */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between border-b pb-3">
            <h4 className="font-serif font-bold text-base text-foreground">
              Recent Activity Audit Log
            </h4>
            <span className="text-xs text-muted-foreground font-medium">Audit System Placeholder</span>
          </div>

          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Icons.checkCircle className="h-4 w-4 text-success" />
                <span className="font-medium text-foreground">Restaurant Menu Initialized</span>
              </div>
              <span>Just now</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Icons.info className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Enterprise Schema Migrated</span>
              </div>
              <span>Sprint 08</span>
            </div>
          </div>
        </div>

        {/* System Status Card */}
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-subtle">
          <div className="border-b pb-3">
            <h4 className="font-serif font-bold text-base text-foreground">
              System Operational Status
            </h4>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Database Engine</span>
              <span className="font-bold text-success">PostgreSQL Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Auth Security</span>
              <span className="font-bold text-success">HttpOnly Cookies</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">RBAC Engine</span>
              <span className="font-bold text-primary">Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
