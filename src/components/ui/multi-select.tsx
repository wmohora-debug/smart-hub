"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

export interface Option {
  label: string;
  value: string;
}

export interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (itemValue: string) => {
    onChange(selected.filter((i) => i !== itemValue));
  };

  const handleSelect = (itemValue: string) => {
    if (selected.includes(itemValue)) {
      handleUnselect(itemValue);
    } else {
      onChange([...selected, itemValue]);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex min-h-[38px] w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm cursor-pointer focus-within:ring-1 focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {selected.length > 0 ? (
          selected.map((val) => {
            const opt = options.find((o) => o.value === val);
            return (
              <Badge key={val} variant="secondary" className="gap-1 pr-1">
                {opt ? opt.label : val}
                <button
                  type="button"
                  className="rounded-full outline-none hover:bg-muted focus:ring-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(val);
                  }}
                >
                  <Icons.close className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <div className="ml-auto text-muted-foreground">
          <Icons.chevronDown className="h-4 w-4" />
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {options.length === 0 ? (
              <div className="p-2 text-center text-xs text-muted-foreground">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                      isSelected && "font-medium",
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Icons.check className="h-4 w-4 text-primary" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
