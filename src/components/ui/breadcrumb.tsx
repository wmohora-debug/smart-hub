import * as React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)} {...props}>
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && <Icons.chevronRight className="h-3.5 w-3.5" />}
              {isLast || !item.href ? (
                <span className={cn("font-medium", isLast && "text-foreground")}>
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
