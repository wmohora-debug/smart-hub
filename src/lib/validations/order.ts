import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const createOrderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  tableId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.string().optional().default("CASH"),
  notes: z.string().optional(),
  items: z.array(createOrderItemSchema).min(1, "Order must contain at least 1 menu item"),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: "Invalid order status value" }),
  }),
  cancellationReason: z.string().optional(),
});
