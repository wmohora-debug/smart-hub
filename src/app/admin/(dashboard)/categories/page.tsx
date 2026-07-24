"use client";

import * as React from "react";
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
import { ImagePickerTrigger } from "@/components/admin/image-picker-trigger";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface CategoryItem {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    menuItems: number;
  };
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createDescription, setCreateDescription] = React.useState("");
  const [createImage, setCreateImage] = React.useState("");
  const [createOrder, setCreateOrder] = React.useState("1");
  const [createSubmitting, setCreateSubmitting] = React.useState(false);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editImage, setEditImage] = React.useState("");
  const [editOrder, setEditOrder] = React.useState("0");
  const [editIsActive, setEditIsActive] = React.useState(true);
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  // Delete Modal State
  const [deletingCategory, setDeletingCategory] = React.useState<CategoryItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);

  // Fetch Categories on Mount
  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        notify.error(data.message || "Failed to load categories");
      }
    } catch {
      notify.error("Network error while loading categories");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Create Dialog with default order set to Highest Existing + 1
  const handleOpenCreateModal = () => {
    const maxOrder = categories.reduce(
      (max, c) => (c.displayOrder > max ? c.displayOrder : max),
      0,
    );
    setCreateOrder(String(maxOrder + 1));
    setCreateName("");
    setCreateDescription("");
    setCreateImage("");
    setIsCreateOpen(true);
  };

  // Filtered Categories
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)),
    );
  }, [categories, searchQuery]);

  // Create Category Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      notify.error("Category name is required.");
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim(),
          image: createImage.trim(),
          displayOrder: parseInt(createOrder, 10) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create category");
      }

      notify.success(`Category "${data.data.name}" created successfully!`);
      setIsCreateOpen(false);
      setCreateName("");
      setCreateDescription("");
      setCreateImage("");
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating category";
      notify.error(msg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Edit Category Handler
  const handleEditOpen = (category: CategoryItem) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || "");
    setEditImage(category.image || "");
    setEditOrder(String(category.displayOrder));
    setEditIsActive(category.isActive);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) {
      notify.error("Category name is required.");
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/v1/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
          image: editImage.trim(),
          displayOrder: parseInt(editOrder, 10) || 0,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update category");
      }

      notify.success(`Category "${data.data.name}" updated successfully!`);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating category";
      notify.error(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Toggle Active Status Handler
  const handleToggleStatus = async (category: CategoryItem) => {
    const nextStatus = !category.isActive;
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, isActive: nextStatus } : c)),
    );

    try {
      const res = await fetch(`/api/v1/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === category.id ? { ...c, isActive: category.isActive } : c)),
        );
        throw new Error(data.message || "Failed to toggle status");
      }

      notify.success(
        `Category "${category.name}" is now ${nextStatus ? "Active (visible on customer menu)" : "Inactive (hidden from customer menu)"}.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error toggling status";
      notify.error(msg);
    }
  };

  // Delete Category Handler
  const handleDeleteSubmit = async () => {
    if (!deletingCategory) return;

    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/v1/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete category");
      }

      notify.success(`Category "${deletingCategory.name}" removed successfully.`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting category";
      notify.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Category Management
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {categories.length} Categories
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Organize restaurant menu categories, ordering, and customer visibility in PostgreSQL.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="primary"
          className="rounded-xl shadow-md shadow-primary/20 flex items-center gap-2"
        >
          <Icons.plus className="h-4 w-4" />
          <span>Add New Category</span>
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-10 rounded-xl"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Categories Data Table / List */}
      {loading ? (
        <div className="flex h-48 w-full items-center justify-center rounded-2xl border bg-card p-8">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No Matching Categories" : "No Categories Found"}
          description={
            searchQuery
              ? `No category matching "${searchQuery}" was found.`
              : "Click 'Add New Category' above to create your first restaurant menu section."
          }
          actionLabel={searchQuery ? "Clear Search" : "Create Category"}
          onAction={searchQuery ? () => setSearchQuery("") : handleOpenCreateModal}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-subtle">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b bg-muted/40 font-serif uppercase tracking-wider text-[11px] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Display Order</th>
                <th className="px-4 py-3.5">Category Name</th>
                <th className="px-4 py-3.5 hidden md:table-cell">Description</th>
                <th className="px-4 py-3.5 text-center">Menu Items</th>
                <th className="px-4 py-3.5 text-center">Customer Visibility</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredCategories.map((cat) => {
                const itemCount = cat._count?.menuItems ?? 0;

                return (
                  <tr key={cat.id} className="hover:bg-accent/40 transition-colors">
                    {/* Display Order Pill */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/80 font-mono font-bold text-xs text-foreground border border-border/60">
                        {cat.displayOrder}
                      </span>
                    </td>

                    {/* Name & Mobile Description */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-foreground font-serif text-sm">
                        {cat.name}
                      </div>
                      {cat.description && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1 md:hidden">
                          {cat.description}
                        </div>
                      )}
                    </td>

                    {/* Desktop Description */}
                    <td className="px-4 py-3.5 hidden md:table-cell text-muted-foreground max-w-xs truncate">
                      {cat.description || "—"}
                    </td>

                    {/* Menu Item Count Badge */}
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5">
                        {itemCount} {itemCount === 1 ? "Item" : "Items"}
                      </Badge>
                    </td>

                    {/* Active Status Switch */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={cat.isActive}
                          onCheckedChange={() => handleToggleStatus(cat)}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            cat.isActive ? "text-success" : "text-muted-foreground"
                          }`}
                        >
                          {cat.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground border-border/60"
                          onClick={() => handleEditOpen(cat)}
                          title="Edit Category"
                        >
                          <Icons.info className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                          onClick={() => setDeletingCategory(cat)}
                          title="Delete Category"
                        >
                          <Icons.trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE CATEGORY DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Add New Category</DialogTitle>
            <DialogDescription className="text-xs">
              Create a new menu category section for your restaurant in PostgreSQL.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name" className="text-xs font-semibold">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-name"
                required
                placeholder="e.g. Starters, Momos, Beverages"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="text-xs sm:text-sm h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-desc" className="text-xs font-semibold">
                Description
              </Label>
              <Textarea
                id="create-desc"
                placeholder="Short description displayed on customer menu..."
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                className="text-xs sm:text-sm min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category Cover Image (Optional)</Label>
              <ImagePickerTrigger
                value={createImage}
                onChange={setCreateImage}
                folder="categories"
                label="Choose Category Image"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-order" className="text-xs font-semibold">
                Display Order Priority
              </Label>
              <Input
                id="create-order"
                type="number"
                min="1"
                value={createOrder}
                onChange={(e) => setCreateOrder(e.target.value)}
                className="text-xs sm:text-sm h-10"
              />
              <p className="text-[10px] text-muted-foreground">
                Defaulted to highest existing order + 1. Lower numbers appear first on customer menu.
              </p>
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
                {createSubmitting ? "Saving..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT CATEGORY DIALOG */}
      <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Edit Category</DialogTitle>
            <DialogDescription className="text-xs">
              Update category details, display order, cover image, or customer visibility.
            </DialogDescription>
          </DialogHeader>

          {editingCategory && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold">
                  Category Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xs sm:text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-desc" className="text-xs font-semibold">
                  Description
                </Label>
                <Textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-xs sm:text-sm min-h-[80px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category Cover Image</Label>
                <ImagePickerTrigger
                  value={editImage}
                  onChange={setEditImage}
                  folder="categories"
                  label="Choose Category Image"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-order" className="text-xs font-semibold">
                    Display Order
                  </Label>
                  <Input
                    id="edit-order"
                    type="number"
                    min="1"
                    value={editOrder}
                    onChange={(e) => setEditOrder(e.target.value)}
                    className="text-xs sm:text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <Label className="text-xs font-semibold mb-2">Customer Visibility</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                    <span className="text-xs font-medium">{editIsActive ? "Active" : "Hidden"}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
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

      {/* DELETE CONFIRMATION DIALOG WITH ITEM COUNT WARNING */}
      <Dialog open={Boolean(deletingCategory)} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-destructive">
              Confirm Category Deletion
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete category &quot;{deletingCategory?.name}&quot;?
            </DialogDescription>
          </DialogHeader>

          {deletingCategory && (
            <div className="space-y-4 py-2">
              {(deletingCategory._count?.menuItems ?? 0) > 0 ? (
                <div className="rounded-xl border border-warning/40 bg-warning/10 p-3.5 text-xs text-warning-foreground space-y-1 font-medium">
                  <div className="flex items-center gap-2 font-bold text-warning text-sm">
                    <Icons.info className="h-4 w-4 shrink-0" />
                    <span>Cannot Delete Active Category</span>
                  </div>
                  <p className="leading-relaxed">
                    This category currently contains{" "}
                    <span className="font-bold underline">
                      {deletingCategory._count?.menuItems} menu item(s)
                    </span>
                    . To prevent orphaned menu items, please reassign or delete its menu items first before deleting this category section.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This action will soft-delete &quot;{deletingCategory.name}&quot; from PostgreSQL. It will immediately be removed from administrative views and customer menus.
                </p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingCategory(null)}
                  disabled={deleteSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={(deletingCategory._count?.menuItems ?? 0) > 0 || deleteSubmitting}
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
