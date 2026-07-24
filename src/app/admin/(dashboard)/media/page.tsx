"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/components/ui/toast-wrapper";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ImagePickerDialog } from "@/components/admin/image-picker-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  folder: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function MediaLibraryAdminPage() {
  const [assets, setAssets] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFolder, setSelectedFolder] = React.useState("all");

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

  // Delete Confirmation Modal State
  const [deletingAsset, setDeletingAsset] = React.useState<MediaItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);

  // Fetch Media Library
  const fetchMedia = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/media?folder=${selectedFolder}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setAssets(data.data || []);
      } else {
        notify.error(data.message || "Failed to load media library");
      }
    } catch {
      notify.error("Network error while loading media library");
    } finally {
      setLoading(false);
    }
  }, [selectedFolder, searchQuery]);

  React.useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Format Bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Delete Handler with Usage Safeguard
  const handleDeleteSubmit = async () => {
    if (!deletingAsset) return;

    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/v1/media/${deletingAsset.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete image asset");
      }

      notify.success(`Image "${deletingAsset.filename}" deleted successfully.`);
      setDeletingAsset(null);
      fetchMedia();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting image";
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
              Media Library
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {assets.length} Images
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Centralized digital asset management and image upload system in PostgreSQL.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          variant="primary"
          className="rounded-xl shadow-md shadow-primary/20 flex items-center gap-2 text-xs"
        >
          <Icons.plus className="h-4 w-4" />
          <span>Upload Image</span>
        </Button>
      </div>

      {/* Search & Folder Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search images by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-10 rounded-xl"
          />
        </div>

        {/* Folder Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {["all", "restaurants", "menu-items", "categories", "general"].map((folder) => {
            const isActive = selectedFolder === folder;
            const labels: Record<string, string> = {
              all: "All Folders",
              restaurants: "Restaurants",
              "menu-items": "Menu Items",
              categories: "Categories",
              general: "General",
            };

            return (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {labels[folder]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Grid View */}
      {loading ? (
        <div className="flex h-48 w-full items-center justify-center rounded-2xl border bg-card p-8">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No Matching Images" : "No Media Assets Found"}
          description={
            searchQuery
              ? `No image matching "${searchQuery}" was found.`
              : "Upload your first image to store in the Media Library."
          }
          actionLabel={searchQuery ? "Clear Filter" : "Upload Image"}
          onAction={searchQuery ? () => setSearchQuery("") : () => setIsUploadOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative flex flex-col rounded-2xl border bg-card overflow-hidden shadow-subtle hover:border-primary/50 transition-all"
            >
              {/* Image Thumbnail */}
              <div className="relative aspect-square w-full bg-muted/40 overflow-hidden">
                <Image
                  src={asset.url}
                  alt={asset.filename}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-card/80 backdrop-blur-md border border-border/40"
                >
                  {asset.folder}
                </Badge>
              </div>

              {/* Info & Delete Bar */}
              <div className="p-3 flex items-center justify-between gap-2 border-t">
                <div className="min-w-0">
                  <div className="font-bold text-xs text-foreground truncate font-serif" title={asset.filename}>
                    {asset.filename}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {formatBytes(asset.size)}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0 rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                  onClick={() => setDeletingAsset(asset)}
                  title="Delete Image"
                >
                  <Icons.trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      <ImagePickerDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSelectImage={() => {
          setIsUploadOpen(false);
          fetchMedia();
        }}
        folder={selectedFolder !== "all" ? (selectedFolder as "restaurants" | "menu-items" | "categories" | "general") : "general"}
        title="Upload Image Asset"
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={Boolean(deletingAsset)} onOpenChange={(open) => !open && setDeletingAsset(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-destructive">
              Delete Media Asset
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete &quot;{deletingAsset?.filename}&quot;?
            </DialogDescription>
          </DialogHeader>

          {deletingAsset && (
            <div className="space-y-4 py-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                This action will verify that the image is not in use by any Restaurant, Category, or Menu Item before deleting it from storage.
              </p>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingAsset(null)}
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
