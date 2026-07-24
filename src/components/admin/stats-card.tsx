import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: keyof typeof Icons;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  className,
}: StatsCardProps) {
  const IconComponent = Icons[icon] || Icons.folderOpen;

  return (
    <Card className={cn("relative overflow-hidden transition-all duration-200 hover:shadow-card hover:border-primary/40", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              {value}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {description}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-subtle">
            <IconComponent className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
