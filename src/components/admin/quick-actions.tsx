"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/components/ui/toast-wrapper";

export function QuickActions() {
  const actions = [
    { title: "Manage Menu", desc: "Add, edit or organize dishes & pricing", icon: "plus", path: "/admin/menu-items" },
    { title: "Edit Categories", desc: "Arrange starters, mains, and beverage sections", icon: "folderOpen", path: "/admin/categories" },
    { title: "QR Generator", desc: "Download table QR codes for customer scanning", icon: "copy", path: "/admin/qr-codes" },
    { title: "Store Settings", desc: "Configure tax rate, currency and operating hours", icon: "info", path: "/admin/settings" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const IconComp = Icons[act.icon as keyof typeof Icons] || Icons.folderOpen;

        return (
          <Card
            key={act.title}
            className="group cursor-pointer border-border/70 hover:border-primary/40 hover:shadow-card transition-all duration-200"
            onClick={() => notify.info(`${act.title} module coming soon in Sprint 09`)}
          >
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
        );
      })}
    </div>
  );
}
