"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/components/ui/toast-wrapper";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { VegIndicator } from "@/components/customer/veg-indicator";
import { ImagePickerTrigger } from "@/components/admin/image-picker-trigger";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface MenuItemData {
  id: string;
  restaurantId: string;
  categoryId: string;
  category?: CategoryOption | null;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  isVeg: boolean;
  isChefSpecial: boolean;
  isPopular: boolean;
  isSoldOut: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export default function MenuItemsAdminPage() {
  const [items, setItems] = React.useState<MenuItemData[]>([]);
  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedAvailability, setSelectedAvailability] = React.useState("all");
  const [selectedDiet, setSelectedDiet] = React.useState("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createDesc, setCreateDesc] = React.useState("");
  const [createCategory, setCreateCategory] = React.useState("");
  const [createPrice, setCreatePrice] = React.useState("");
  const [createImage, setCreateImage] = React.useState("");
  const [createIsVeg, setCreateIsVeg] = React.useState(true);
  const [createIsPopular, setCreateIsPopular] = React.useState(false);
  const [createIsChefSpecial, setCreateIsChefSpecial] = React.useState(false);
  const [createIsSoldOut, setCreateIsSoldOut] = React.useState(false);
  const [createSubmitting, setCreateSubmitting] = React.useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = React.useState<MenuItemData | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editCategory, setEditCategory] = React.useState("");
  const [editPrice, setEditPrice] = React.useState("");
  const [editImage, setEditImage] = React.useState("");
  const [editIsVeg, setEditIsVeg] = React.useState(true);
  const [editIsPopular, setEditIsPopular] = React.useState(false);
  const [editIsChefSpecial, setEditIsChefSpecial] = React.useState(false);
  const [editIsSoldOut, setEditIsSoldOut] = React.useState(false);
  const [editIsActive, setEditIsActive] = React.useState(true);
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  // Delete Modal State
  const [deletingItem, setDeletingItem] = React.useState<MenuItemData | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);

  // 1. Fetch Menu Items & Categories on Mount
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, catRes] = await Promise.all([
        fetch("/api/v1/menu-items"),
        fetch("/api/v1/categories"),
      ]);

      const itemsData = await itemsRes.json();
      const catData = await catRes.json();

      if (itemsData.success) {
        setItems(itemsData.data || []);
      }
      if (catData.success) {
        setCategories(catData.data || []);
        if (catData.data?.length > 0 && !createCategory) {
          setCreateCategory(catData.data[0].id);
        }
      }
    } catch {
      notify.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  }, [createCategory]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Filtered Items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      // Category Filter
      if (selectedCategory !== "all" && item.categoryId !== selectedCategory) {
        return false;
      }

      // Availability Filter
      if (selectedAvailability === "available" && (item.isSoldOut || !item.isActive)) {
        return false;
      }
      if (selectedAvailability === "sold-out" && !item.isSoldOut) {
        return false;
      }
      if (selectedAvailability === "hidden" && item.isActive) {
        return false;
      }

      // Dietary Filter
      if (selectedDiet === "veg" && !item.isVeg) return false;
      if (selectedDiet === "non-veg" && item.isVeg) return false;

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedAvailability, selectedDiet]);

  // 3. Create Menu Item Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      notify.error("Item name is required.");
      return;
    }
    if (!createDesc.trim()) {
      notify.error("Description is required.");
      return;
    }
    if (!createCategory) {
      notify.error("Category selection is required.");
      return;
    }
    const priceNum = parseFloat(createPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      notify.error("Price must be a valid positive number.");
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await fetch("/api/v1/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDesc.trim(),
          categoryId: createCategory,
          price: priceNum,
          image: createImage.trim() || "/images/food-placeholder.png",
          isVeg: createIsVeg,
          isPopular: createIsPopular,
          isChefSpecial: createIsChefSpecial,
          isSoldOut: createIsSoldOut,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create menu item");
      }

      notify.success(`Menu item "${data.data.name}" added successfully!`);
      setIsCreateOpen(false);
      setCreateName("");
      setCreateDesc("");
      setCreatePrice("");
      setCreateImage("");
      setCreateIsVeg(true);
      setCreateIsPopular(false);
      setCreateIsChefSpecial(false);
      setCreateIsSoldOut(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating menu item";
      notify.error(msg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // 4. Edit Open Handler
  const handleEditOpen = (item: MenuItemData) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDesc(item.description);
    setEditCategory(item.categoryId);
    setEditPrice(String(item.price));
    setEditImage(item.image || "");
    setEditIsVeg(item.isVeg);
    setEditIsPopular(item.isPopular);
    setEditIsChefSpecial(item.isChefSpecial);
    setEditIsSoldOut(item.isSoldOut);
    setEditIsActive(item.isActive);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName.trim()) {
      notify.error("Item name is required.");
      return;
    }
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      notify.error("Price must be a valid positive number.");
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/v1/menu-items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDesc.trim(),
          categoryId: editCategory,
          price: priceNum,
          image: editImage.trim() || "/images/food-placeholder.png",
          isVeg: editIsVeg,
          isPopular: editIsPopular,
          isChefSpecial: editIsChefSpecial,
          isSoldOut: editIsSoldOut,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update menu item");
      }

      notify.success(`Menu item "${data.data.name}" updated successfully!`);
      setEditingItem(null);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating menu item";
      notify.error(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // 5. Instant Toggle Property Handler
  const handleToggle = async (
    item: MenuItemData,
    property: "isSoldOut" | "isActive" | "isVeg" | "isPopular" | "isChefSpecial",
    nextVal: boolean,
  ) => {
    // Optimistic UI Update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, [property]: nextVal } : i)),
    );

    try {
      const res = await fetch(`/api/v1/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property, value: nextVal }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Revert UI on error
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, [property]: item[property] } : i)),
        );
        throw new Error(data.message || "Failed to update property");
      }

      const propNames: Record<string, string> = {
        isSoldOut: nextVal ? "Marked as Sold Out" : "Marked as Available",
        isActive: nextVal ? "Activated (Visible on customer menu)" : "Hidden from customer menu",
        isVeg: nextVal ? "Diet set to Vegetarian" : "Diet set to Non-Vegetarian",
        isPopular: nextVal ? "Tagged as Popular" : "Removed Popular tag",
        isChefSpecial: nextVal ? "Tagged as Chef Special" : "Removed Chef Special tag",
      };

      notify.success(`"${item.name}": ${propNames[property]}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating item";
      notify.error(msg);
    }
  };

  // 6. Delete Handler
  const handleDeleteSubmit = async () => {
    if (!deletingItem) return;

    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/v1/menu-items/${deletingItem.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete item");
      }

      notify.success(`Menu item "${deletingItem.name}" deleted successfully.`);
      setDeletingItem(null);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting menu item";
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
              Menu Item Management
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {items.length} Total Items
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage food dishes, pricing, dietary flags, and sold-out status directly in PostgreSQL.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          variant="primary"
          className="rounded-xl shadow-md shadow-primary/20 flex items-center gap-2"
        >
          <Icons.plus className="h-4 w-4" />
          <span>Add Menu Item</span>
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dish or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-10 rounded-xl"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Availability Filter */}
        <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
          <SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl">
            <SelectValue placeholder="All Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Availability</SelectItem>
            <SelectItem value="available">Available Only</SelectItem>
            <SelectItem value="sold-out">Sold Out Only</SelectItem>
            <SelectItem value="hidden">Hidden Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Dietary Filter */}
        <Select value={selectedDiet} onValueChange={setSelectedDiet}>
          <SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl">
            <SelectValue placeholder="All Diets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Diets</SelectItem>
            <SelectItem value="veg">Vegetarian</SelectItem>
            <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Menu Items Data Table */}
      {loading ? (
        <div className="flex h-48 w-full items-center justify-center rounded-2xl border bg-card p-8">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No Menu Items Found"
          description="No menu items matched your search and filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setSelectedCategory("all");
            setSelectedAvailability("all");
            setSelectedDiet("all");
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-subtle">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b bg-muted/40 font-serif uppercase tracking-wider text-[11px] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Dish Info</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5 text-center">Diet</th>
                <th className="px-4 py-3.5 text-center">Badges</th>
                <th className="px-4 py-3.5 text-center">Customer Visibility</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                  {/* Dish Info (Thumbnail + Name + Description) */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center border border-border/60">
                        <Icons.folderOpen className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground font-serif text-sm line-clamp-1">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category Badge */}
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[11px] font-semibold border-border/70">
                      {item.category?.name || "Unassigned"}
                    </Badge>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 font-sans font-bold text-foreground">
                    ₹{Number(item.price)}
                  </td>

                  {/* Diet Indicator Toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(item, "isVeg", !item.isVeg)}
                      title="Click to toggle Veg / Non-Veg"
                      className="cursor-pointer hover:scale-110 transition-transform"
                    >
                      <VegIndicator isVeg={item.isVeg} />
                    </button>
                  </td>

                  {/* Badges Toggles */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggle(item, "isPopular", !item.isPopular)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          item.isPopular
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground border-border/40 hover:border-primary/40"
                        }`}
                      >
                        Popular
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(item, "isChefSpecial", !item.isChefSpecial)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          item.isChefSpecial
                            ? "bg-accent text-accent-foreground border-primary/30"
                            : "bg-muted/40 text-muted-foreground border-border/40 hover:border-primary/40"
                        }`}
                      >
                        Chef
                      </button>
                    </div>
                  </td>

                  {/* Customer Visibility & Sold Out Switches */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={(val) => handleToggle(item, "isActive", val)}
                        />
                        <span className={`text-[11px] font-semibold ${item.isActive ? "text-success" : "text-muted-foreground"}`}>
                          {item.isActive ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggle(item, "isSoldOut", !item.isSoldOut)}
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border transition-all ${
                            item.isSoldOut
                              ? "bg-destructive/10 text-destructive border-destructive/30"
                              : "text-muted-foreground border-border/30 hover:text-foreground"
                          }`}
                        >
                          {item.isSoldOut ? "Sold Out" : "In Stock"}
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground border-border/60"
                        onClick={() => handleEditOpen(item)}
                        title="Edit Menu Item"
                      >
                        <Icons.info className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                        onClick={() => setDeletingItem(item)}
                        title="Delete Menu Item"
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

      {/* CREATE MENU ITEM DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Add New Menu Item</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new dish or beverage to your restaurant menu in PostgreSQL.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-item-name" className="text-xs font-semibold">
                  Dish Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-item-name"
                  required
                  placeholder="e.g. Chicken Momo, Truffle Pizza"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="text-xs sm:text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-item-cat" className="text-xs font-semibold">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={createCategory} onValueChange={setCreateCategory}>
                  <SelectTrigger id="create-item-cat" className="h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-item-desc" className="text-xs font-semibold">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="create-item-desc"
                required
                placeholder="Ingredients, preparation style, and flavor profile..."
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                className="text-xs sm:text-sm min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-item-price" className="text-xs font-semibold">
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-item-price"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 290"
                  value={createPrice}
                  onChange={(e) => setCreatePrice(e.target.value)}
                  className="text-xs sm:text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Dish Image
                </Label>
                <ImagePickerTrigger
                  value={createImage}
                  onChange={setCreateImage}
                  folder="menu-items"
                  label="Choose Dish Image"
                />
              </div>
            </div>

            {/* Checkboxes / Toggles Bar */}
            <div className="border-t pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-veg"
                  checked={createIsVeg}
                  onCheckedChange={(checked) => setCreateIsVeg(Boolean(checked))}
                />
                <Label htmlFor="create-veg" className="cursor-pointer">Vegetarian</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-pop"
                  checked={createIsPopular}
                  onCheckedChange={(checked) => setCreateIsPopular(Boolean(checked))}
                />
                <Label htmlFor="create-pop" className="cursor-pointer">Popular</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-chef"
                  checked={createIsChefSpecial}
                  onCheckedChange={(checked) => setCreateIsChefSpecial(Boolean(checked))}
                />
                <Label htmlFor="create-chef" className="cursor-pointer">Chef Special</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-sold"
                  checked={createIsSoldOut}
                  onCheckedChange={(checked) => setCreateIsSoldOut(Boolean(checked))}
                />
                <Label htmlFor="create-sold" className="cursor-pointer text-destructive">Sold Out</Label>
              </div>
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
                {createSubmitting ? "Adding..." : "Add Menu Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MENU ITEM DIALOG */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Edit Menu Item</DialogTitle>
            <DialogDescription className="text-xs">
              Update dish details, price, category, or customer availability flags.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-item-name" className="text-xs font-semibold">
                    Dish Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-item-name"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-xs sm:text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-item-cat" className="text-xs font-semibold">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger id="edit-item-cat" className="h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-item-desc" className="text-xs font-semibold">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="edit-item-desc"
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="text-xs sm:text-sm min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-item-price" className="text-xs font-semibold">
                    Price (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-item-price"
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="text-xs sm:text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Dish Image
                  </Label>
                  <ImagePickerTrigger
                    value={editImage}
                    onChange={setEditImage}
                    folder="menu-items"
                    label="Choose Dish Image"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="border-t pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-veg"
                    checked={editIsVeg}
                    onCheckedChange={(checked) => setEditIsVeg(Boolean(checked))}
                  />
                  <Label htmlFor="edit-veg" className="cursor-pointer">Vegetarian</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-pop"
                    checked={editIsPopular}
                    onCheckedChange={(checked) => setEditIsPopular(Boolean(checked))}
                  />
                  <Label htmlFor="edit-pop" className="cursor-pointer">Popular</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-chef"
                    checked={editIsChefSpecial}
                    onCheckedChange={(checked) => setEditIsChefSpecial(Boolean(checked))}
                  />
                  <Label htmlFor="edit-chef" className="cursor-pointer">Chef Special</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-sold"
                    checked={editIsSoldOut}
                    onCheckedChange={(checked) => setEditIsSoldOut(Boolean(checked))}
                  />
                  <Label htmlFor="edit-sold" className="cursor-pointer text-destructive">Sold Out</Label>
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold">Visible to Customers</span>
                <div className="flex items-center gap-2">
                  <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                  <span className="text-xs">{editIsActive ? "Active" : "Hidden"}</span>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
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

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-destructive">
              Delete Menu Item
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete &quot;{deletingItem?.name}&quot;?
            </DialogDescription>
          </DialogHeader>

          {deletingItem && (
            <div className="space-y-4 py-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                This action will soft-delete &quot;{deletingItem.name}&quot; from PostgreSQL. It will immediately be removed from customer menus and digital ordering lists.
              </p>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingItem(null)}
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
