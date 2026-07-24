"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leadingIcon, trailingIcon, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        {leadingIcon && (
          <div className="absolute left-3 text-muted-foreground pointer-events-none">
            {leadingIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            leadingIcon && "pl-9",
            trailingIcon && "pr-9",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          ref={ref}
          {...props}
        />
        {trailingIcon && (
          <div className="absolute right-3 text-muted-foreground pointer-events-none">
            {trailingIcon}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative flex w-full items-center">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <Icons.eyeOff className="h-4 w-4" />
          ) : (
            <Icons.eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    return (
      <Input
        type="text"
        leadingIcon={<Icons.search className="h-4 w-4" />}
        trailingIcon={
          value ? (
            <button
              type="button"
              onClick={() => {
                if (onChange) {
                  const event = {
                    target: { value: "" },
                  } as React.ChangeEvent<HTMLInputElement>;
                  onChange(event);
                }
              }}
              className="pointer-events-auto hover:text-foreground"
            >
              <Icons.close className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
        value={value}
        onChange={onChange}
        className={className}
        ref={ref}
        {...props}
      />
    );
  },
);
SearchInput.displayName = "SearchInput";

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, min, max, step = 1, value, onChange, ...props }, ref) => {
    const handleIncrement = () => {
      const current = Number(value || 0);
      const next = current + Number(step);
      if (max !== undefined && next > Number(max)) return;
      if (onChange) {
        const event = {
          target: { value: String(next) },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    const handleDecrement = () => {
      const current = Number(value || 0);
      const next = current - Number(step);
      if (min !== undefined && next < Number(min)) return;
      if (onChange) {
        const event = {
          target: { value: String(next) },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    return (
      <div className="relative flex items-center w-full">
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className={cn("pr-12", className)}
          ref={ref}
          {...props}
        />
        <div className="absolute right-1 flex flex-col border-l pl-1">
          <button
            type="button"
            onClick={handleIncrement}
            className="px-1 text-muted-foreground hover:text-foreground text-xs"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="px-1 text-muted-foreground hover:text-foreground text-xs"
          >
            ▼
          </button>
        </div>
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";

export { Input, PasswordInput, SearchInput, NumberInput };
