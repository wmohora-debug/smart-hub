"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/components/ui/toast-wrapper";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ImagePickerTrigger } from "@/components/admin/image-picker-trigger";

export interface RestaurantFormData {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  banner: string;
  openingTime: string;
  closingTime: string;
  autoOpen: boolean;
  isOverrideClosed: boolean;
  prepTime: string;
  deliveryTime: string;
}

export default function RestaurantAdminPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [initialData, setInitialData] = React.useState<RestaurantFormData | null>(null);
  const [formData, setFormData] = React.useState<RestaurantFormData>({
    id: "",
    name: "",
    tagline: "",
    logo: "",
    banner: "",
    openingTime: "10:00 AM",
    closingTime: "10:30 PM",
    autoOpen: true,
    isOverrideClosed: false,
    prepTime: "15-20 min",
    deliveryTime: "30-45 min",
  });

  // 1. Fetch Restaurant Data from API
  const fetchRestaurantData = React.useCallback(async () => {
    try {
      setLoading(true);
      const restRes = await fetch("/api/v1/restaurants");
      const restData = await restRes.json();

      if (restData.success && restData.data) {
        const r = restData.data;

        const loaded: RestaurantFormData = {
          id: r.id || "",
          name: r.name || "",
          tagline: r.tagline || "",
          logo: r.logo || "",
          banner: r.banner || "",
          openingTime: r.openingTime || "10:00 AM",
          closingTime: r.closingTime || "10:30 PM",
          autoOpen: r.autoOpen ?? true,
          isOverrideClosed: r.isOverrideClosed ?? false,
          prepTime: r.prepTime || "15-20 min",
          deliveryTime: r.deliveryTime || "30-45 min",
        };

        setFormData(loaded);
        setInitialData(loaded);
      }
    } catch {
      notify.error("Failed to load restaurant profile");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  // Track if user has unsaved changes
  const isDirty = React.useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Form Field Change Handler
  const handleChange = (field: keyof RestaurantFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notify.error("Restaurant Name is required.");
      return;
    }

    setSaving(true);
    try {
      const restRes = await fetch("/api/v1/restaurants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name.trim(),
          tagline: formData.tagline.trim(),
          logo: formData.logo.trim(),
          banner: formData.banner.trim(),
          openingTime: formData.openingTime.trim(),
          closingTime: formData.closingTime.trim(),
          autoOpen: formData.autoOpen,
          isOverrideClosed: formData.isOverrideClosed,
          prepTime: formData.prepTime.trim(),
          deliveryTime: formData.deliveryTime.trim(),
        }),
      });

      const restData = await restRes.json();

      if (!restRes.ok || !restData.success) {
        throw new Error(restData.message || "Failed to update restaurant profile");
      }

      notify.success("Restaurant profile updated successfully in PostgreSQL!");
      setInitialData(formData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving restaurant profile";
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    if (initialData) setFormData(initialData);
    notify.info("Changes reset to database state.");
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl border bg-card p-8">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Restaurant Profile & Settings
            </h1>
            {isDirty && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Single source of truth for restaurant identity, branding, and operating hours in PostgreSQL.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || saving}
            className="text-xs rounded-xl"
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty || saving}
            className="rounded-xl shadow-md shadow-primary/20 flex items-center gap-2 text-xs"
          >
            {saving ? <Spinner className="h-4 w-4" /> : <Icons.check className="h-4 w-4" />}
            <span>Save Profile</span>
          </Button>
        </div>
      </div>

      {/* Settings Form Tabs */}
      <Tabs defaultValue="basic" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="basic" className="text-xs py-2 rounded-lg font-semibold">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs py-2 rounded-lg font-semibold">
            Branding
          </TabsTrigger>
          <TabsTrigger value="business" className="text-xs py-2 rounded-lg font-semibold">
            Operating Hours
          </TabsTrigger>
        </TabsList>

        {/* 1. BASIC INFORMATION TAB */}
        <TabsContent value="basic">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-bold">1. Basic Information</CardTitle>
              <CardDescription className="text-xs">
                Essential restaurant identity and primary tagline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rest-name" className="text-xs font-semibold">
                    Restaurant Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rest-name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rest-tagline" className="text-xs font-semibold">
                    Tagline
                  </Label>
                  <Input
                    id="rest-tagline"
                    placeholder="e.g. Freshly prepared fast food, snacks & drinks"
                    value={formData.tagline}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. BRANDING TAB */}
        <TabsContent value="branding">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-bold">2. Visual Branding</CardTitle>
              <CardDescription className="text-xs">
                Configure restaurant logo and hero banner cover image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Restaurant Logo</Label>
                  <ImagePickerTrigger
                    value={formData.logo}
                    onChange={(url) => handleChange("logo", url)}
                    folder="restaurants"
                    label="Choose Logo Image"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Hero Banner Cover</Label>
                  <ImagePickerTrigger
                    value={formData.banner}
                    onChange={(url) => handleChange("banner", url)}
                    folder="restaurants"
                    label="Choose Hero Banner"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. BUSINESS INFORMATION TAB */}
        <TabsContent value="business">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-bold">3. Business Hours & Schedule</CardTitle>
              <CardDescription className="text-xs">
                Operating schedule, open/close status, and preparation times.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rest-open-time" className="text-xs font-semibold">Opening Time</Label>
                  <Input
                    id="rest-open-time"
                    placeholder="e.g. 10:00 AM"
                    value={formData.openingTime}
                    onChange={(e) => handleChange("openingTime", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rest-close-time" className="text-xs font-semibold">Closing Time</Label>
                  <Input
                    id="rest-close-time"
                    placeholder="e.g. 10:30 PM"
                    value={formData.closingTime}
                    onChange={(e) => handleChange("closingTime", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                  <div>
                    <div className="font-semibold">Auto-Open Schedule</div>
                    <div className="text-[11px] text-muted-foreground">Automatically display Open status based on operating hours</div>
                  </div>
                  <Switch
                    checked={formData.autoOpen}
                    onCheckedChange={(val) => handleChange("autoOpen", val)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-destructive/20 bg-destructive/5">
                  <div>
                    <div className="font-semibold text-destructive">Manual Force Closed</div>
                    <div className="text-[11px] text-muted-foreground">Override schedule and display Closed badge on customer menu</div>
                  </div>
                  <Switch
                    checked={formData.isOverrideClosed}
                    onCheckedChange={(val) => handleChange("isOverrideClosed", val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rest-prep" className="text-xs font-semibold">Est. Preparation Time</Label>
                  <Input
                    id="rest-prep"
                    placeholder="e.g. 15-20 min"
                    value={formData.prepTime}
                    onChange={(e) => handleChange("prepTime", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rest-delivery" className="text-xs font-semibold">Est. Delivery Time</Label>
                  <Input
                    id="rest-delivery"
                    placeholder="e.g. 30-45 min"
                    value={formData.deliveryTime}
                    onChange={(e) => handleChange("deliveryTime", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
