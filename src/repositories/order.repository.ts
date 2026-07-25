import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { OrderFilterDTO } from "@/types/dto";

export class OrderRepository {
  static async getAllOrders(restaurantId: string, options: OrderFilterDTO = {}) {
    const {
      status,
      tableId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      restaurantId,
      ...(status ? { status } : {}),
      ...(tableId ? { tableId } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" } },
              { customerName: { contains: search, mode: "insensitive" } },
              { customerPhone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            orderBy: { createdAt: "asc" },
          },
          table: {
            select: {
              id: true,
              name: true,
              tableNumber: true,
              zone: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
        table: {
          select: {
            id: true,
            name: true,
            tableNumber: true,
            zone: true,
            slug: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });
  }

  static async findByOrderNumber(restaurantId: string, orderNumber: string) {
    return prisma.order.findFirst({
      where: { restaurantId, orderNumber },
      include: {
        items: true,
        table: true,
      },
    });
  }

  static async create(data: {
    restaurantId: string;
    tableId?: string;
    orderNumber: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    serviceCharge: number;
    serviceChargeAmount: number;
    totalAmount: number;
    notes?: string;
    items: Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      totalPrice: number;
      notes?: string;
    }>;
  }) {
    return prisma.order.create({
      data: {
        restaurantId: data.restaurantId,
        tableId: data.tableId || null,
        orderNumber: data.orderNumber,
        customerName: data.customerName?.trim() || null,
        customerPhone: data.customerPhone?.trim() || null,
        paymentMethod: data.paymentMethod || "CASH",
        subtotal: new Prisma.Decimal(data.subtotal),
        taxRate: new Prisma.Decimal(data.taxRate),
        taxAmount: new Prisma.Decimal(data.taxAmount),
        serviceCharge: new Prisma.Decimal(data.serviceCharge),
        serviceChargeAmount: new Prisma.Decimal(data.serviceChargeAmount),
        totalAmount: new Prisma.Decimal(data.totalAmount),
        notes: data.notes?.trim() || null,
        items: {
          create: data.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: new Prisma.Decimal(item.price),
            quantity: item.quantity,
            totalPrice: new Prisma.Decimal(item.totalPrice),
            notes: item.notes?.trim() || null,
          })),
        },
      },
      include: {
        items: true,
        table: true,
      },
    });
  }

  static async updateStatus(
    id: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus,
    cancellationReason?: string,
  ) {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(cancellationReason !== undefined ? { cancellationReason: cancellationReason?.trim() || null } : {}),
      },
      include: {
        items: true,
        table: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.order.delete({
      where: { id },
    });
  }
}
