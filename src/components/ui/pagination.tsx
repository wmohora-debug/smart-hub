import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
  ...props
}: PaginationProps) {
  return (
    <nav
      aria-label="Pagination Navigation"
      className={cn("flex items-center justify-center space-x-2", className)}
      {...props}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage <= 1}
      >
        <Icons.chevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground px-2">
        Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages}
      >
        Next
        <Icons.chevronRight className="h-4 w-4 ml-1" />
      </Button>
    </nav>
  );
}
