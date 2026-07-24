"use client";

import * as React from "react";

export interface SelectedTableState {
  tableId: string | null;
  tableSlug: string | null;
  tableName: string | null;
  zone: string | null;
  capacity: number | null;
}

export interface TableContextType extends SelectedTableState {
  isTableSelected: boolean;
  setTableData: (table: {
    id: string;
    slug: string;
    name: string;
    zone?: string | null;
    capacity?: number | null;
  }) => void;
  clearTable: () => void;
}

const STORAGE_KEY = "smart_menu_table_info";

const TableContext = React.createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tableState, setTableState] = React.useState<SelectedTableState>({
    tableId: null,
    tableSlug: null,
    tableName: null,
    zone: null,
    capacity: null,
  });

  // Load table info from localStorage on initial client mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.tableSlug) {
          setTableState(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setTableData = React.useCallback(
    (table: {
      id: string;
      slug: string;
      name: string;
      zone?: string | null;
      capacity?: number | null;
    }) => {
      const newState: SelectedTableState = {
        tableId: table.id,
        tableSlug: table.slug,
        tableName: table.name,
        zone: table.zone || "Main Dining",
        capacity: table.capacity || 2,
      };
      setTableState(newState);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch {
        // Ignore storage errors
      }
    },
    [],
  );

  const clearTable = React.useCallback(() => {
    setTableState({
      tableId: null,
      tableSlug: null,
      tableName: null,
      zone: null,
      capacity: null,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = React.useMemo(
    () => ({
      ...tableState,
      isTableSelected: Boolean(tableState.tableSlug),
      setTableData,
      clearTable,
    }),
    [tableState, setTableData, clearTable],
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTable(): TableContextType {
  const context = React.useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
}
