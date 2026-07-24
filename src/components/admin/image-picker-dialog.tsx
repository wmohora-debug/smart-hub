"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/components/ui/toast-wrapper";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface MediaAssetItem {
  id: string;
  filename: string;
  url: string;
  folder: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface ImagePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (url: string) => void;
  folder?: "restaurants" | "menu-items" | "categories" | "general";
  title?: string;
}

export function ImagePickerDialog({
  open,
  onOpenChange,
  onSelectImage,
  folder = "general",
  title = "Select Image Asset",
}: ImagePickerDialogProps) {
  const [assets, setAssets] = React.useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedUrl, setSelectedUrl] = React.useState("");

  // Upload Tab State
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch Library Images
  const fetchLibrary = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/media?folder=${folder}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setAssets(data.data || []);
      }
    } catch {
      notify.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  }, [folder, searchQuery]);

  React.useEffect(() => {
    if (open) {
      fetchLibrary();
    }
  }, [open, fetchLibrary]);

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      notify.error("File size exceeds 10 MB limit.");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      notify.error("Invalid file type. Only PNG, JPG, JPEG, and WEBP are supported.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/v1/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload image");
      }

      notify.success(`Image "${data.data.filename}" uploaded successfully!`);
      onSelectImage(data.data.url);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading file";
      notify.error(msg);
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedUrl) {
      onSelectImage(selectedUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-xs">
            Choose an existing image from the Media Library or upload a new image.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="library" className="text-xs py-2 rounded-lg font-semibold">
              Media Library
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs py-2 rounded-lg font-semibold">
              Upload New Image
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MEDIA LIBRARY */}
          <TabsContent value="library" className="space-y-4">
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search media assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 rounded-xl"
              />
            </div>

            {loading ? (
              <div className="flex h-48 w-full items-center justify-center rounded-xl border bg-card">
                <Spinner className="h-6 w-6 text-primary" />
              </div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed text-center p-4">
                <p className="text-xs text-muted-foreground">No images found in library.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs rounded-xl"
                >
                  Upload First Image
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1 no-scrollbar">
                {assets.map((asset) => {
                  const isSelected = selectedUrl === asset.url;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedUrl(asset.url)}
                      className={`group relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                          : "border-border/60 hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={asset.url}
                        alt={asset.filename}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 text-[10px] text-white truncate font-medium">
                        {asset.filename}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Icons.check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-[11px] text-muted-foreground truncate max-w-xs">
                {selectedUrl ? `Selected: ${selectedUrl}` : "Select an image above"}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedUrl}
                  onClick={handleConfirmSelect}
                >
                  Select Image
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: UPLOAD NEW IMAGE */}
          <TabsContent value="upload">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border/80 hover:border-primary/50 bg-card"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="h-8 w-8 text-primary" />
                  <p className="text-xs font-semibold text-foreground">Uploading image to server...</p>
                </div>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Icons.plus className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Drag & Drop Image Here</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Supports PNG, JPG, JPEG, WEBP up to 10 MB.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-xl text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Local File
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
