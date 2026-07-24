import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-bold tracking-tight text-foreground", {
  variants: {
    level: {
      h1: "scroll-m-20 text-4xl font-extrabold lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold",
      h4: "scroll-m-20 text-xl font-semibold",
      h5: "scroll-m-20 text-lg font-semibold",
      h6: "scroll-m-20 text-base font-semibold",
    },
  },
  defaultVariants: {
    level: "h1",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Heading({
  level = "h1",
  as,
  className,
  children,
  ...props
}: HeadingProps) {
  const Component = as || level || "h1";
  return (
    <Component
      className={cn(headingVariants({ level, className }))}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Subheading({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function Title({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function Body({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props}>
      {children}
    </p>
  );
}

export function Caption({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-xs text-muted-foreground", className)} {...props}>
      {children}
    </span>
  );
}

export function Muted({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function Small({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <small className={cn("text-sm font-medium leading-none", className)} {...props}>
      {children}
    </small>
  );
}

export function Overline({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Code({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
