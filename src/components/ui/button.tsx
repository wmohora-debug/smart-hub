import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        xs: "h-7 rounded-sm px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 px-4 py-2 text-sm",
        lg: "h-10 rounded-md px-6 text-base",
        xl: "h-12 rounded-lg px-8 text-lg",
        icon: "h-9 w-9 p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      leadingIcon,
      trailingIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : leadingIcon ? (
          <span className="mr-2 inline-flex items-center">{leadingIcon}</span>
        ) : null}
        {children}
        {!isLoading && trailingIcon ? (
          <span className="ml-2 inline-flex items-center">{trailingIcon}</span>
        ) : null}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
