import { z } from "zod";

const urlOrPathSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const str = val.trim();
      if (str.startsWith("/")) return true;
      try {
        const parsed = new URL(str);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid local path (starting with '/') or HTTP/HTTPS URL" },
  );

export const createRestaurantSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(2, "Restaurant Name is required").max(100),
  tagline: z.string().max(150).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  longDescription: z.string().max(2000).optional().or(z.literal("")),
  logo: urlOrPathSchema,
  banner: urlOrPathSchema,
  favicon: urlOrPathSchema,
  themeColor: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: urlOrPathSchema,
  openingTime: z.string().max(30).optional().or(z.literal("")),
  closingTime: z.string().max(30).optional().or(z.literal("")),
  autoOpen: z.boolean().default(true),
  isOverrideClosed: z.boolean().default(false),
  prepTime: z.string().max(50).optional().or(z.literal("")),
  deliveryTime: z.string().max(50).optional().or(z.literal("")),
  facebookUrl: urlOrPathSchema,
  instagramUrl: urlOrPathSchema,
  twitterUrl: urlOrPathSchema,
  youtubeUrl: urlOrPathSchema,
  googleMapsUrl: urlOrPathSchema,
  metaTitle: z.string().max(150).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  keywords: z.string().max(300).optional().or(z.literal("")),
  currency: z.string().default("INR"),
  timezone: z.string().default("Asia/Kolkata"),
});

export const updateRestaurantSchema = createRestaurantSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
