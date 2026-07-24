import { z } from "zod";

export const createTableSchema = z.object({
  restaurantId: z.string().cuid(),
  name: z.string().min(1, "Table Name is required").max(60),
  tableNumber: z.number().int().min(1, "Table number must be positive"),
  capacity: z.number().int().min(1, "Capacity must be at least 1").default(2),
  zone: z.string().max(60).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  slug: z.string().max(60).optional().or(z.literal("")),
});

export const updateTableSchema = createTableSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
