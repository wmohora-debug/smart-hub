"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/shared/icons";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (columnKey: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  searchable = false,
  searchPlaceholder = "Search records...",
  searchValue = "",
  onSearchChange,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  sortColumn,
  sortDirection = "asc",
  onSortChange,
  page,
  totalPages,
  onPageChange,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display at this time.",
}: DataTableProps<T>) {
  const allIds = data.map(keyExtractor);
  const isAllSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(Array.from(new Set([...selectedIds, ...allIds])));
    } else {
      onSelectionChange(selectedIds.filter((id) => !allIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    }
  };

  return (
    <div className="w-full space-y-4">
      {searchable && (
        <div className="flex items-center justify-between">
          <div className="w-full sm:w-72">
            <SearchInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>
      )}

      <Table stickyHeader>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className={col.className}
                onClick={() =>
                  col.sortable &&
                  col.accessorKey &&
                  onSortChange?.(String(col.accessorKey))
                }
              >
                <div
                  className={
                    col.sortable
                      ? "flex cursor-pointer items-center space-x-1 hover:text-foreground"
                      : undefined
                  }
                >
                  <span>{col.header}</span>
                  {col.sortable && col.accessorKey === sortColumn && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? (
                        <Icons.chevronUp className="h-3.5 w-3.5 inline" />
                      ) : (
                        <Icons.chevronDown className="h-3.5 w-3.5 inline" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rIdx) => (
              <TableRow key={rIdx}>
                {selectable && (
                  <TableCell>
                    <Skeleton className="h-4 w-4 rounded" />
                  </TableCell>
                )}
                {columns.map((_, cIdx) => (
                  <TableCell key={cIdx}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="h-48 text-center"
              >
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  variant={searchValue ? "no-search" : "no-data"}
                  className="border-0 bg-transparent py-4"
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const rowId = keyExtractor(row);
              const isSelected = selectedIds.includes(rowId);

              return (
                <TableRow key={rowId} selected={isSelected}>
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectRow(rowId, Boolean(checked))
                        }
                        aria-label={`Select row ${rowId}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} className={col.className}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey] ?? "")
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {page && totalPages && onPageChange && totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}
