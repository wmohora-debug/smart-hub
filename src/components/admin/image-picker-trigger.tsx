"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { ImagePickerDialog } from "@/components/admin/image-picker-dialog";

export interface ImagePickerTriggerProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "restaurants" | "menu-items" | "categories" | "general";
  label?: string;
}

export function ImagePickerTrigger({
  value,
  onChange,
  folder = "general",
  label = "Choose Image",
}: ImagePickerTriggerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {/* Thumbnail Preview */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt="Selected Preview"
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <Icons.folderOpen className="h-6 w-6 text-muted-foreground/40" />
          )}
        </div>

        {/* Trigger Controls */}
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="text-xs rounded-xl flex items-center gap-1.5 h-9"
            >
              <Icons.plus className="h-3.5 w-3.5" />
              <span>{label}</span>
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
                className="text-xs text-muted-foreground hover:text-destructive h-9 px-2"
                title="Remove Image"
              >
                <Icons.trash className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <span className="text-[10px] text-muted-foreground truncate max-w-xs">
            {value || "No image selected"}
          </span>
        </div>
      </div>

      <ImagePickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelectImage={onChange}
        folder={folder}
      />
    </div>
  );
}
