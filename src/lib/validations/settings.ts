import { z } from "zod";

export const createSettingsSchema = z.object({
  restaurantId: z.string().cuid(),
  taxRate: z.number().min(0).max(100).default(5.0),
  serviceCharge: z.number().min(0).max(100).default(0.0),
  currency: z.string().default("INR"),
});

export const updateSettingsSchema = createSettingsSchema.partial();

export type CreateSettingsInput = z.infer<typeof createSettingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
