import { z } from "zod";

export const createCategorySchema = z.object({
  restaurantId: z.string().cuid(),
  name: z.string().min(2).max(60),
  description: z.string().optional(),
  image: z.string().optional().or(z.literal("")),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
