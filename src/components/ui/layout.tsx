import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("py-8 md:py-12 lg:py-16", className)} {...props}>
      {children}
    </section>
  );
}

export function Stack({
  className,
  space = "4",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { space?: string }) {
  const spaceClassMap: Record<string, string> = {
    "1": "space-y-1",
    "2": "space-y-2",
    "3": "space-y-3",
    "4": "space-y-4",
    "6": "space-y-6",
    "8": "space-y-8",
  };
  return (
    <div
      className={cn("flex flex-col", spaceClassMap[space] || "space-y-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Flex({
  className,
  align = "items-center",
  justify = "justify-between",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: string;
  justify?: string;
}) {
  return (
    <div className={cn("flex", align, justify, className)} {...props}>
      {children}
    </div>
  );
}

export function Grid({
  className,
  cols = "1",
  gap = "4",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  cols?: "1" | "2" | "3" | "4" | "6" | "12";
  gap?: string;
}) {
  const colsClassMap: Record<string, string> = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 md:grid-cols-2",
    "3": "grid-cols-1 md:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    "6": "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    "12": "grid-cols-12",
  };
  return (
    <div
      className={cn(
        "grid",
        colsClassMap[cols] || "grid-cols-1",
        `gap-${gap}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Spacer({ size = 4 }: { size?: number }) {
  return <div style={{ height: `${size * 4}px` }} />;
}

export function Surface({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
