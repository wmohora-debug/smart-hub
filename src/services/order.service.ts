import { OrderRepository } from "@/repositories/order.repository";
import { MenuRepository } from "@/repositories/menu.repository";
import { SettingsRepository } from "@/repositories/settings.repository";
import { CreateOrderDTO, OrderFilterDTO } from "@/types/dto";
import { createOrderSchema, updateOrderStatusSchema } from "@/lib/validations/order";
import { OrderStatus, PaymentStatus } from "@prisma/client";

function roundToTwoDecimals(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.ACCEPTED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  ACCEPTED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.SERVED, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  SERVED: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export class OrderService {
  static async getAllOrders(restaurantId: string, options: OrderFilterDTO = {}) {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    return OrderRepository.getAllOrders(restaurantId, options);
  }

  static async getOrderById(id: string) {
    if (!id) throw new Error("Order ID is required");
    const order = await OrderRepository.findById(id);
    if (!order) throw new Error("Order not found");
    return order;
  }

  static async createOrder(dto: CreateOrderDTO) {
    const validated = createOrderSchema.parse(dto);

    // Fetch restaurant settings for service charge rate (GST removed)
    const settings = await SettingsRepository.findByRestaurantId(validated.restaurantId);
    const taxRate = 0.0;
    const serviceCharge = settings ? Number(settings.serviceCharge) : 0.0;

    // Validate items and snapshot current prices & names
    let subtotal = 0;
    const snapshottedItems = await Promise.all(
      validated.items.map(async (item) => {
        const dish = await MenuRepository.findById(item.menuItemId);
        if (!dish) {
          throw new Error(`Menu item with ID "${item.menuItemId}" was not found.`);
        }
        if (!dish.isActive) {
          throw new Error(`Dish "${dish.name}" is currently unavailable.`);
        }
        if (dish.isSoldOut) {
          throw new Error(`Dish "${dish.name}" is currently sold out.`);
        }

        const unitPrice = Number(dish.price);
        const itemTotal = roundToTwoDecimals(unitPrice * item.quantity);
        subtotal += itemTotal;

        return {
          menuItemId: dish.id,
          name: dish.name,
          price: unitPrice,
          quantity: item.quantity,
          totalPrice: itemTotal,
          notes: item.notes,
        };
      }),
    );

    subtotal = roundToTwoDecimals(subtotal);
    const taxAmount = 0.0;
    const serviceChargeAmount = roundToTwoDecimals(subtotal * (serviceCharge / 100));
    const totalAmount = roundToTwoDecimals(subtotal + serviceChargeAmount);

    // Generate unique order number
    const orderNumber = `#ORD-${Date.now().toString().slice(-6)}`;

    return OrderRepository.create({
      restaurantId: validated.restaurantId,
      tableId: validated.tableId,
      orderNumber,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      paymentMethod: validated.paymentMethod,
      subtotal,
      taxRate,
      taxAmount,
      serviceCharge,
      serviceChargeAmount,
      totalAmount,
      notes: validated.notes,
      items: snapshottedItems,
    });
  }

  static async updateOrderStatus(
    id: string,
    newStatus: OrderStatus,
    cancellationReason?: string,
  ) {
    const validated = updateOrderStatusSchema.parse({ status: newStatus, cancellationReason });

    const order = await OrderRepository.findById(id);
    if (!order) throw new Error("Order not found");

    if (order.status === validated.status) {
      return order;
    }

    const allowedNextStatuses = VALID_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedNextStatuses.includes(validated.status)) {
      throw new Error(
        `Invalid status transition from "${order.status}" to "${validated.status}". Allowed next states: ${
          allowedNextStatuses.length > 0 ? allowedNextStatuses.join(", ") : "None (Terminal State)"
        }`,
      );
    }

    let paymentStatus: PaymentStatus | undefined;
    if (validated.status === OrderStatus.COMPLETED) {
      paymentStatus = PaymentStatus.PAID;
    }

    return OrderRepository.updateStatus(
      id,
      validated.status,
      paymentStatus,
      validated.cancellationReason,
    );
  }

  static async deleteOrder(id: string) {
    const order = await OrderRepository.findById(id);
    if (!order) throw new Error("Order not found");

    return OrderRepository.delete(id);
  }
}
