"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { TableProvider } from "@/context/table-context";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <TableProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </TableProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
