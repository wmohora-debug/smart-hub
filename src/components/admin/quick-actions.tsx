"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

export function QuickActions() {
  const actions = [
    { title: "Live Orders", desc: "View incoming customer tickets, KDS & status", icon: "folderOpen" as const, path: "/admin/orders" },
    { title: "Manage Menu", desc: "Add, edit or organize dishes & pricing", icon: "plus" as const, path: "/admin/menu-items" },
    { title: "Edit Categories", desc: "Arrange starters, mains, and beverage sections", icon: "folderOpen" as const, path: "/admin/categories" },
    { title: "Tables & QR", desc: "Manage dining tables and download QR codes", icon: "copy" as const, path: "/admin/tables" },
    { title: "Media Library", desc: "Upload and manage banners, logos & dish photos", icon: "copy" as const, path: "/admin/media" },
    { title: "Restaurant Profile", desc: "Update name, tagline, branding and banners", icon: "info" as const, path: "/admin/restaurant" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((act) => {
        const IconComp = Icons[act.icon] || Icons.folderOpen;

        return (
          <Link key={act.title} href={act.path} className="block">
            <Card className="group cursor-pointer border-border/70 hover:border-primary/40 hover:shadow-card transition-all duration-200 h-full">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/80 text-accent-foreground border border-primary/20 group-hover:scale-105 transition-transform">
                    <IconComp className="h-5 w-5 text-primary" />
                  </div>
                  <Icons.chevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {act.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
