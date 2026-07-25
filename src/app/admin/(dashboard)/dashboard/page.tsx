import * as React from "react";
import { getSession } from "@/lib/auth/session";
import { DashboardService } from "@/services/dashboard.service";
import { StatsCard } from "@/components/admin/stats-card";
import { QuickActions } from "@/components/admin/quick-actions";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  let stats = {
    restaurantName: "Smart Tech Food Hub",
    categoryCount: 0,
    menuItemCount: 0,
    popularCount: 0,
    chefSpecialCount: 0,
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

      {/* Statistics Grid */}
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
    </div>
  );
}
