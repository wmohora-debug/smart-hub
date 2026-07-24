import { z } from "zod";

const imagePathSchema = z
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
    { message: "Must be a valid local path (e.g. /images/placeholder.png) or HTTP/HTTPS URL" },
  );

export const createMenuItemSchema = z.object({
  restaurantId: z.string().cuid(),
  categoryId: z.string().cuid(),
  name: z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  price: z.number().positive(),
  image: imagePathSchema,
  isVeg: z.boolean().default(true),
  isChefSpecial: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isSoldOut: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateMenuItemSchema = createMenuItemSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
