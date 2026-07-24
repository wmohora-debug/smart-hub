"use client";

import * as React from "react";
import { SearchInput } from "@/components/ui/input";

export interface SearchSectionProps {
  placeholder?: string;
  value: string;
  onChange: (query: string) => void;
}

export function SearchSection({
  placeholder = "Search dishes, drinks, or ingredients...",
  value,
  onChange,
}: SearchSectionProps) {
  return (
    <div className="sticky top-0 z-20 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl py-3 px-4 sm:px-6 shadow-subtle transition-all">
      <div className="mx-auto max-w-3xl">
        <SearchInput
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 text-xs sm:text-sm rounded-full bg-card/70 border-border/80 pl-10 shadow-subtle focus-visible:ring-primary focus-visible:border-primary/50"
        />
      </div>
    </div>
  );
}
