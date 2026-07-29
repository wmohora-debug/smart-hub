"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/components/ui/toast-wrapper";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { generateQRCodeSvg } from "@/lib/qr-generator";
import { getTableQrUrl } from "@/lib/url";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface TableItem {
  id: string;
  name: string;
  tableNumber: number;
  capacity: number;
  zone?: string | null;
  notes?: string | null;
  slug: string;
  qrCodeImage?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function TablesAdminPage() {
  const [tables, setTables] = React.useState<TableItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedZone, setSelectedZone] = React.useState("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createNumber, setCreateNumber] = React.useState("1");
  const [createCapacity, setCreateCapacity] = React.useState("2");
  const [createZone, setCreateZone] = React.useState("Main Dining");
  const [createNotes, setCreateNotes] = React.useState("");
  const [createSubmitting, setCreateSubmitting] = React.useState(false);

  // Edit Modal State
  const [editingTable, setEditingTable] = React.useState<TableItem | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editNumber, setEditNumber] = React.useState("1");
  const [editCapacity, setEditCapacity] = React.useState("2");
  const [editZone, setEditZone] = React.useState("Main Dining");
  const [editNotes, setEditNotes] = React.useState("");
  const [editIsActive, setEditIsActive] = React.useState(true);
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  // Delete Modal State
  const [deletingTable, setDeletingTable] = React.useState<TableItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);

  // QR Code Actions Modal State
  const [qrModalTable, setQrModalTable] = React.useState<TableItem | null>(null);

  // Fetch Tables
  const fetchTables = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/tables");
      const data = await res.json();
      if (data.success) {
        setTables(data.data || []);
      } else {
        notify.error(data.message || "Failed to load tables");
      }
    } catch {
      notify.error("Network error while loading tables");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Open Create Dialog with next table number auto-suggested
  const handleOpenCreateModal = () => {
    const maxNum = tables.reduce((max, t) => (t.tableNumber > max ? t.tableNumber : max), 0);
    const nextNum = maxNum + 1;
    setCreateNumber(String(nextNum));
    setCreateName(`Table ${nextNum}`);
    setCreateCapacity("2");
    setCreateZone("Main Dining");
    setCreateNotes("");
    setIsCreateOpen(true);
  };

  // Filtered Tables
  const filteredTables = React.useMemo(() => {
    return tables.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        String(t.tableNumber).includes(searchQuery.trim()) ||
        (t.zone && t.zone.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      const matchesZone = selectedZone === "all" || (t.zone && t.zone.toLowerCase() === selectedZone.toLowerCase());

      return matchesSearch && matchesZone;
    });
  }, [tables, searchQuery, selectedZone]);

  // Unique Zones list
  const availableZones = React.useMemo(() => {
    const zones = new Set<string>();
    tables.forEach((t) => {
      if (t.zone) zones.add(t.zone);
    });
    return Array.from(zones);
  }, [tables]);

  // Create Table Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      notify.error("Table name is required.");
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await fetch("/api/v1/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          tableNumber: parseInt(createNumber, 10) || 1,
          capacity: parseInt(createCapacity, 10) || 2,
          zone: createZone.trim(),
          notes: createNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create table");
      }

      notify.success(`Table "${data.data.name}" created with QR Code!`);
      setIsCreateOpen(false);
      fetchTables();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating table";
      notify.error(msg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Edit Table Handler
  const handleEditOpen = (table: TableItem) => {
    setEditingTable(table);
    setEditName(table.name);
    setEditNumber(String(table.tableNumber));
    setEditCapacity(String(table.capacity));
    setEditZone(table.zone || "Main Dining");
    setEditNotes(table.notes || "");
    setEditIsActive(table.isActive);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editName.trim()) {
      notify.error("Table name is required.");
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/v1/tables/${editingTable.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          tableNumber: parseInt(editNumber, 10) || 1,
          capacity: parseInt(editCapacity, 10) || 2,
          zone: editZone.trim(),
          notes: editNotes.trim(),
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update table");
      }

      notify.success(`Table "${data.data.name}" updated successfully!`);
      setEditingTable(null);
      fetchTables();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating table";
      notify.error(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (table: TableItem) => {
    const nextStatus = !table.isActive;
    setTables((prev) =>
      prev.map((t) => (t.id === table.id ? { ...t, isActive: nextStatus } : t)),
    );

    try {
      const res = await fetch(`/api/v1/tables/${table.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTables((prev) =>
          prev.map((t) => (t.id === table.id ? { ...t, isActive: table.isActive } : t)),
        );
        throw new Error(data.message || "Failed to toggle status");
      }

      notify.success(
        `Table "${table.name}" status set to ${nextStatus ? "Active" : "Inactive"}.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error toggling status";
      notify.error(msg);
    }
  };

  // Delete Table Handler
  const handleDeleteSubmit = async () => {
    if (!deletingTable) return;

    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/v1/tables/${deletingTable.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete table");
      }

      notify.success(`Table "${deletingTable.name}" removed successfully.`);
      setDeletingTable(null);
      fetchTables();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting table";
      notify.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Regenerate QR Code
  const handleRegenerateQr = async (tableId: string) => {
    try {
      const res = await fetch(`/api/v1/tables/${tableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateQr: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to regenerate QR code");
      }

      notify.success("QR Code regenerated successfully!");
      if (qrModalTable?.id === tableId) {
        setQrModalTable(data.data);
      }
      fetchTables();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error regenerating QR Code";
      notify.error(msg);
    }
  };

  // Download SVG Helper
  const handleDownloadSvg = async (table: TableItem) => {
    try {
      const url = getTableQrUrl(table.slug);
      const svgString = await generateQRCodeSvg(url, 512);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `QR-${table.slug}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      notify.success(`Downloaded vector SVG for ${table.name}`);
    } catch {
      notify.error("Failed to generate vector SVG");
    }
  };

  // Download PNG Helper
  const handleDownloadPng = (table: TableItem) => {
    if (!table.qrCodeImage) return;
    const a = document.createElement("a");
    a.href = table.qrCodeImage;
    a.download = `QR-${table.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify.success(`Downloaded PNG image for ${table.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Table & QR Code Management
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {tables.length} Tables
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure dining tables, seating capacities, zones, and dynamic QR Code ordering entry points.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="primary"
          className="rounded-xl shadow-md shadow-primary/20 flex items-center gap-2"
        >
          <Icons.plus className="h-4 w-4" />
          <span>Add New Table</span>
        </Button>
      </div>

      {/* Toolbar: Search & Zone Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tables by name, number, zone, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-10 rounded-xl"
          />
        </div>

        {/* Zone Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {["all", "Main Dining", "Terrace", "VIP", "Garden", "Bar", ...availableZones.filter((z) => !["Main Dining", "Terrace", "VIP", "Garden", "Bar"].includes(z))].map((zone) => {
            const isActive = selectedZone.toLowerCase() === zone.toLowerCase();
            return (
              <button
                key={zone}
                type="button"
                onClick={() => setSelectedZone(zone)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {zone === "all" ? "All Zones" : zone}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex h-48 w-full items-center justify-center rounded-2xl border bg-card p-8">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : filteredTables.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No Matching Tables" : "No Dining Tables Configured"}
          description={
            searchQuery
              ? `No table matching "${searchQuery}" was found.`
              : "Click 'Add New Table' above to create table seating and QR codes in PostgreSQL."
          }
          actionLabel={searchQuery ? "Clear Search" : "Create Table"}
          onAction={searchQuery ? () => setSearchQuery("") : handleOpenCreateModal}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-subtle">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b bg-muted/40 font-serif uppercase tracking-wider text-[11px] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">QR Preview</th>
                <th className="px-4 py-3.5">Table Number</th>
                <th className="px-4 py-3.5">Name / Target Slug</th>
                <th className="px-4 py-3.5 text-center">Capacity</th>
                <th className="px-4 py-3.5">Zone</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredTables.map((t) => (
                <tr key={t.id} className="hover:bg-accent/40 transition-colors">
                  {/* QR Code Thumbnail */}
                  <td className="px-4 py-3">
                    <div
                      onClick={() => setQrModalTable(t)}
                      className="relative h-12 w-12 shrink-0 rounded-xl border border-border/80 bg-white p-1 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all flex items-center justify-center"
                      title="Click to view & download QR"
                    >
                      {t.qrCodeImage ? (
                        <Image
                          src={t.qrCodeImage}
                          alt={`QR for ${t.name}`}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      ) : (
                        <Icons.copy className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </td>

                  {/* Table Number Pill */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 font-mono font-bold text-sm text-primary border border-primary/20">
                      #{t.tableNumber}
                    </span>
                  </td>

                  {/* Name & Slug */}
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-foreground font-serif text-sm">
                      {t.name}
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      /?table={t.slug}
                    </div>
                  </td>

                  {/* Capacity Badge */}
                  <td className="px-4 py-3.5 text-center">
                    <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5">
                      {t.capacity} Seats
                    </Badge>
                  </td>

                  {/* Zone */}
                  <td className="px-4 py-3.5">
                    <Badge variant="outline" className="text-xs font-semibold bg-accent/50 text-foreground border-border/60">
                      {t.zone || "Main Dining"}
                    </Badge>
                  </td>

                  {/* Status Switch */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={t.isActive}
                        onCheckedChange={() => handleToggleStatus(t)}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          t.isActive ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        {t.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 px-2.5 rounded-lg border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setQrModalTable(t)}
                        title="View QR Code & Print Card"
                      >
                        <Icons.copy className="h-3.5 w-3.5 mr-1" />
                        <span>QR</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground border-border/60"
                        onClick={() => handleEditOpen(t)}
                        title="Edit Table"
                      >
                        <Icons.info className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                        onClick={() => setDeletingTable(t)}
                        title="Delete Table"
                      >
                        <Icons.trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE TABLE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Add Dining Table</DialogTitle>
            <DialogDescription className="text-xs">
              Create a new dining table and automatically generate its customer QR Code ordering URL.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-tbl-num" className="text-xs font-semibold">
                  Table Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-tbl-num"
                  type="number"
                  min="1"
                  required
                  value={createNumber}
                  onChange={(e) => {
                    const num = e.target.value;
                    setCreateNumber(num);
                    if (num) setCreateName(`Table ${num}`);
                  }}
                  className="text-xs sm:text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-tbl-cap" className="text-xs font-semibold">
                  Seating Capacity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-tbl-cap"
                  type="number"
                  min="1"
                  required
                  value={createCapacity}
                  onChange={(e) => setCreateCapacity(e.target.value)}
                  className="text-xs sm:text-sm h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-tbl-name" className="text-xs font-semibold">
                Table Name / Display Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-tbl-name"
                required
                placeholder="e.g. Table 1, Terrace VIP Table"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="text-xs sm:text-sm h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-tbl-zone" className="text-xs font-semibold">
                Dining Zone / Section
              </Label>
              <Input
                id="create-tbl-zone"
                placeholder="e.g. Main Dining, Terrace, VIP, Garden, Bar"
                value={createZone}
                onChange={(e) => setCreateZone(e.target.value)}
                className="text-xs sm:text-sm h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-tbl-notes" className="text-xs font-semibold">
                Internal Notes (Optional)
              </Label>
              <Textarea
                id="create-tbl-notes"
                placeholder="e.g. Window side, near entrance..."
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                className="text-xs sm:text-sm min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createSubmitting}>
                {createSubmitting ? "Generating..." : "Create Table & QR"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT TABLE DIALOG */}
      <Dialog open={Boolean(editingTable)} onOpenChange={(open) => !open && setEditingTable(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Edit Table Details</DialogTitle>
            <DialogDescription className="text-xs">
              Update capacity, dining zone, table status, or internal notes.
            </DialogDescription>
          </DialogHeader>

          {editingTable && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-tbl-num" className="text-xs font-semibold">
                    Table Number
                  </Label>
                  <Input
                    id="edit-tbl-num"
                    type="number"
                    min="1"
                    required
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="text-xs sm:text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-tbl-cap" className="text-xs font-semibold">
                    Seating Capacity
                  </Label>
                  <Input
                    id="edit-tbl-cap"
                    type="number"
                    min="1"
                    required
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="text-xs sm:text-sm h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-tbl-name" className="text-xs font-semibold">
                  Table Name
                </Label>
                <Input
                  id="edit-tbl-name"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xs sm:text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-tbl-zone" className="text-xs font-semibold">
                  Zone
                </Label>
                <Input
                  id="edit-tbl-zone"
                  value={editZone}
                  onChange={(e) => setEditZone(e.target.value)}
                  className="text-xs sm:text-sm h-10"
                />
              </div>

              <div className="space-y-1.5 flex items-center justify-between border-t border-b py-2.5">
                <div>
                  <Label className="text-xs font-semibold">Table Status</Label>
                  <p className="text-[10px] text-muted-foreground">Active tables allow QR menu ordering</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                  <span className="text-xs font-medium">{editIsActive ? "Active" : "Inactive"}</span>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingTable(null)}
                  disabled={editSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={editSubmitting}>
                  {editSubmitting ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* QR CODE ACTIONS MODAL */}
      <Dialog open={Boolean(qrModalTable)} onOpenChange={(open) => !open && setQrModalTable(null)}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">
              QR Code — {qrModalTable?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Scan to view digital menu or download/print table QR card.
            </DialogDescription>
          </DialogHeader>

          {qrModalTable && (
            <div className="space-y-5 py-3 flex flex-col items-center">
              {/* QR Printable Card Frame */}
              <div
                id="printable-qr-card"
                className="w-64 border-2 border-primary/30 rounded-3xl p-5 bg-card shadow-lg flex flex-col items-center gap-3"
              >
                <div className="font-serif text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Smart Food Hub</span>
                </div>

                <div className="relative h-44 w-44 rounded-2xl border border-border/60 bg-white p-2 flex items-center justify-center">
                  {qrModalTable.qrCodeImage && (
                    <Image
                      src={qrModalTable.qrCodeImage}
                      alt={qrModalTable.name}
                      width={160}
                      height={160}
                      className="object-contain"
                    />
                  )}
                </div>

                <div>
                  <div className="font-serif font-extrabold text-base text-primary">
                    {qrModalTable.name}
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground">
                    {qrModalTable.zone || "Main Dining"} • {qrModalTable.capacity} Seats
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-mono">
                  /?table={qrModalTable.slug}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPng(qrModalTable)}
                  className="text-xs rounded-xl"
                >
                  Download PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSvg(qrModalTable)}
                  className="text-xs rounded-xl"
                >
                  Download SVG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.print();
                  }}
                  className="text-xs rounded-xl"
                >
                  Print Card
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegenerateQr(qrModalTable.id)}
                  className="text-xs rounded-xl text-primary border-primary/30"
                >
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE TABLE CONFIRMATION DIALOG */}
      <Dialog open={Boolean(deletingTable)} onOpenChange={(open) => !open && setDeletingTable(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-destructive">
              Delete Dining Table
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete &quot;{deletingTable?.name}&quot;?
            </DialogDescription>
          </DialogHeader>

          {deletingTable && (
            <div className="space-y-4 py-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                This action will soft-delete table &quot;{deletingTable.name}&quot; from PostgreSQL. Its QR Code link will no longer assign customers to this table.
              </p>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingTable(null)}
                  disabled={deleteSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteSubmitting}
                  onClick={handleDeleteSubmit}
                >
                  {deleteSubmitting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
