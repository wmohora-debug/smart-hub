"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  description: string;
  longDescription: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  logo: string;
  banner: string;
  favicon: string;
  themeColor: string;
  openingTime: string;
  closingTime: string;
  autoOpen: boolean;
  isOverrideClosed: boolean;
  prepTime: string;
  deliveryTime: string;
  currency: string;
  taxRate: string;
  serviceCharge: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  googleMapsUrl: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export default function RestaurantAdminPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [initialData, setInitialData] = React.useState<RestaurantFormData | null>(null);
  const [formData, setFormData] = React.useState<RestaurantFormData>({
    id: "",
    name: "",
    tagline: "",
    description: "",
    longDescription: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    logo: "",
    banner: "",
    favicon: "",
    themeColor: "#D97706",
    openingTime: "10:00 AM",
    closingTime: "10:30 PM",
    autoOpen: true,
    isOverrideClosed: false,
    prepTime: "15-20 min",
    deliveryTime: "30-45 min",
    currency: "INR",
    taxRate: "5.00",
    serviceCharge: "0.00",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    googleMapsUrl: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  // 1. Fetch Restaurant Data from API
  const fetchRestaurantData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [restRes, settingsRes] = await Promise.all([
        fetch("/api/v1/restaurants"),
        fetch("/api/v1/settings"),
      ]);

      const restData = await restRes.json();
      const settingsData = await settingsRes.json();

      if (restData.success && restData.data) {
        const r = restData.data;
        const s = settingsData.data || {};

        const loaded: RestaurantFormData = {
          id: r.id || "",
          name: r.name || "",
          tagline: r.tagline || "",
          description: r.description || "",
          longDescription: r.longDescription || "",
          address: r.address || "",
          city: r.city || "",
          state: r.state || "",
          country: r.country || "",
          postalCode: r.postalCode || "",
          phone: r.phone || "",
          whatsapp: r.whatsapp || "",
          email: r.email || "",
          website: r.website || "",
          logo: r.logo || "",
          banner: r.banner || "",
          favicon: r.favicon || "",
          themeColor: r.themeColor || "#D97706",
          openingTime: r.openingTime || "10:00 AM",
          closingTime: r.closingTime || "10:30 PM",
          autoOpen: r.autoOpen ?? true,
          isOverrideClosed: r.isOverrideClosed ?? false,
          prepTime: r.prepTime || "15-20 min",
          deliveryTime: r.deliveryTime || "30-45 min",
          currency: r.currency || s.currency || "INR",
          taxRate: s.taxRate !== undefined ? String(s.taxRate) : "5.00",
          serviceCharge: s.serviceCharge !== undefined ? String(s.serviceCharge) : "0.00",
          facebookUrl: r.facebookUrl || "",
          instagramUrl: r.instagramUrl || "",
          twitterUrl: r.twitterUrl || "",
          youtubeUrl: r.youtubeUrl || "",
          googleMapsUrl: r.googleMapsUrl || "",
          metaTitle: r.metaTitle || "",
          metaDescription: r.metaDescription || "",
          keywords: r.keywords || "",
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
      const [restRes, settingsRes] = await Promise.all([
        fetch("/api/v1/restaurants", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: formData.id,
            name: formData.name.trim(),
            tagline: formData.tagline.trim(),
            description: formData.description.trim(),
            longDescription: formData.longDescription.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            country: formData.country.trim(),
            postalCode: formData.postalCode.trim(),
            phone: formData.phone.trim(),
            whatsapp: formData.whatsapp.trim(),
            email: formData.email.trim(),
            website: formData.website.trim(),
            logo: formData.logo.trim(),
            banner: formData.banner.trim(),
            favicon: formData.favicon.trim(),
            themeColor: formData.themeColor.trim(),
            openingTime: formData.openingTime.trim(),
            closingTime: formData.closingTime.trim(),
            autoOpen: formData.autoOpen,
            isOverrideClosed: formData.isOverrideClosed,
            prepTime: formData.prepTime.trim(),
            deliveryTime: formData.deliveryTime.trim(),
            facebookUrl: formData.facebookUrl.trim(),
            instagramUrl: formData.instagramUrl.trim(),
            twitterUrl: formData.twitterUrl.trim(),
            youtubeUrl: formData.youtubeUrl.trim(),
            googleMapsUrl: formData.googleMapsUrl.trim(),
            metaTitle: formData.metaTitle.trim(),
            metaDescription: formData.metaDescription.trim(),
            keywords: formData.keywords.trim(),
            currency: formData.currency.trim(),
          }),
        }),
        fetch("/api/v1/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: formData.id,
            taxRate: parseFloat(formData.taxRate) || 0,
            serviceCharge: parseFloat(formData.serviceCharge) || 0,
            currency: formData.currency.trim(),
          }),
        }),
      ]);

      const restData = await restRes.json();
      const settingsData = await settingsRes.json();

      if (!restRes.ok || !restData.success) {
        throw new Error(restData.message || "Failed to update restaurant profile");
      }
      if (!settingsRes.ok || !settingsData.success) {
        throw new Error(settingsData.message || "Failed to update settings");
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
            Single source of truth for restaurant branding, contact details, business hours, and SEO in PostgreSQL.
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="basic" className="text-xs py-2 rounded-lg font-semibold">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs py-2 rounded-lg font-semibold">
            Branding
          </TabsTrigger>
          <TabsTrigger value="business" className="text-xs py-2 rounded-lg font-semibold">
            Business & Tax
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs py-2 rounded-lg font-semibold">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="seo" className="text-xs py-2 rounded-lg font-semibold">
            SEO & Meta
          </TabsTrigger>
        </TabsList>

        {/* 1. BASIC INFORMATION TAB */}
        <TabsContent value="basic">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-bold">1. Basic Information</CardTitle>
              <CardDescription className="text-xs">
                Essential restaurant identity, address, and primary contact information.
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
                    placeholder="e.g. Premium Artisanal Digital Menu & Culinary Bistro"
                    value={formData.tagline}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rest-desc" className="text-xs font-semibold">
                  Short Description
                </Label>
                <Textarea
                  id="rest-desc"
                  placeholder="Appears in header, banners, and search previews..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-[70px] text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rest-long-desc" className="text-xs font-semibold">
                  Long Description / Story
                </Label>
                <Textarea
                  id="rest-long-desc"
                  placeholder="Full culinary story displayed on footer or about section..."
                  value={formData.longDescription}
                  onChange={(e) => handleChange("longDescription", e.target.value)}
                  className="min-h-[100px] text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rest-address" className="text-xs font-semibold">
                  Street Address
                </Label>
                <Input
                  id="rest-address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rest-city" className="text-xs font-semibold">City</Label>
                  <Input
                    id="rest-city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rest-state" className="text-xs font-semibold">State</Label>
                  <Input
                    id="rest-state"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rest-country" className="text-xs font-semibold">Country</Label>
                  <Input
                    id="rest-country"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rest-postal" className="text-xs font-semibold">Postal Code</Label>
                  <Input
                    id="rest-postal"
                    value={formData.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rest-phone" className="text-xs font-semibold">Phone Number</Label>
                  <Input
                    id="rest-phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rest-whatsapp" className="text-xs font-semibold">WhatsApp Number</Label>
                  <Input
                    id="rest-whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rest-email" className="text-xs font-semibold">Primary Email</Label>
                  <Input
                    id="rest-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rest-website" className="text-xs font-semibold">Official Website</Label>
                  <Input
                    id="rest-website"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
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
              <CardTitle className="font-serif text-lg font-bold">2. Visual Branding & Colors</CardTitle>
              <CardDescription className="text-xs">
                Configure logo URLs, hero banner covers, favicons, and accent theme colors.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Favicon Asset</Label>
                  <ImagePickerTrigger
                    value={formData.favicon}
                    onChange={(url) => handleChange("favicon", url)}
                    folder="restaurants"
                    label="Choose Favicon"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rest-color" className="text-xs font-semibold">Theme Primary Color (Hex)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.themeColor || "#D97706"}
                      onChange={(e) => handleChange("themeColor", e.target.value)}
                      className="h-10 w-12 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <Input
                      id="rest-color"
                      value={formData.themeColor}
                      onChange={(e) => handleChange("themeColor", e.target.value)}
                      className="h-10 text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. BUSINESS INFORMATION TAB */}
        <TabsContent value="business">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-bold">3. Business Hours & Financial Settings</CardTitle>
              <CardDescription className="text-xs">
                Operating schedule, open/close status, preparation times, tax, and service charges.
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
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

                <div className="space-y-1.5">
                  <Label htmlFor="rest-currency" className="text-xs font-semibold">Currency Code</Label>
                  <Input
                    id="rest-currency"
                    value={formData.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="h-10 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rest-tax" className="text-xs font-semibold">GST / Tax Rate (%)</Label>
                  <Input
                    id="rest-tax"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.taxRate}
                    onChange={(e) => handleChange("taxRate", e.target.value)}
                    className="h-10 text-xs sm:text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rest-service" className="text-xs font-semibold">Service Charge (%)</Label>
                  <Input
                    id="rest-service"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.serviceCharge}
                    onChange={(e) => handleChange("serviceCharge", e.target.value)}
                    className="h-10 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. SOCIAL MEDIA TAB */}
        <TabsContent value="social">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-bold">4. Social Media & Maps Links</CardTitle>
              <CardDescription className="text-xs">
                Links displayed on the customer footer, contact card, and location maps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rest-fb" className="text-xs font-semibold">Facebook URL</Label>
                  <Input
                    id="rest-fb"
                    placeholder="https://facebook.com/..."
                    value={formData.facebookUrl}
                    onChange={(e) => handleChange("facebookUrl", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rest-ig" className="text-xs font-semibold">Instagram URL</Label>
                  <Input
                    id="rest-ig"
                    placeholder="https://instagram.com/..."
                    value={formData.instagramUrl}
                    onChange={(e) => handleChange("instagramUrl", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rest-tw" className="text-xs font-semibold">X (Twitter) URL</Label>
                  <Input
                    id="rest-tw"
                    placeholder="https://twitter.com/..."
                    value={formData.twitterUrl}
                    onChange={(e) => handleChange("twitterUrl", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rest-yt" className="text-xs font-semibold">YouTube Channel URL</Label>
                  <Input
                    id="rest-yt"
                    placeholder="https://youtube.com/@..."
                    value={formData.youtubeUrl}
                    onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 border-t pt-4">
                <Label htmlFor="rest-maps" className="text-xs font-semibold">Google Maps URL</Label>
                <Input
                  id="rest-maps"
                  placeholder="https://maps.google.com/?q=..."
                  value={formData.googleMapsUrl}
                  onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. SEO TAB */}
        <TabsContent value="seo">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-bold">5. SEO & Search Engine Optimization</CardTitle>
              <CardDescription className="text-xs">
                Configure browser tab titles, meta descriptions, and keywords for search engines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="rest-meta-title" className="text-xs font-semibold">Browser Meta Title</Label>
                <Input
                  id="rest-meta-title"
                  placeholder="e.g. Smart Tech Food Hub — Artisanal Digital Menu & Bistro"
                  value={formData.metaTitle}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rest-meta-desc" className="text-xs font-semibold">Search Meta Description</Label>
                <Textarea
                  id="rest-meta-desc"
                  placeholder="Displayed in Google search snippets..."
                  value={formData.metaDescription}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                  className="min-h-[80px] text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rest-keywords" className="text-xs font-semibold">Meta Keywords</Label>
                <Input
                  id="rest-keywords"
                  placeholder="Comma-separated keywords, e.g. Smart Tech, Namchi, Digital Menu"
                  value={formData.keywords}
                  onChange={(e) => handleChange("keywords", e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Sticky Action Bar */}
      <Card className="rounded-2xl bg-card border shadow-subtle p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          {isDirty ? (
            <span className="text-amber-500 font-semibold">⚠️ You have unsaved changes in your restaurant profile.</span>
          ) : (
            <span>All profile data is synchronized with PostgreSQL.</span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
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
      </Card>
    </form>
  );
}
