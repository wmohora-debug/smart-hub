import { prisma } from "@/lib/prisma";
import { CreateTableDTO, UpdateTableDTO } from "@/types/dto";

export class TableRepository {
  static async getAllByRestaurant(restaurantId: string) {
    return prisma.table.findMany({
      where: { restaurantId },
      orderBy: [{ tableNumber: "asc" }],
    });
  }

  static async findById(id: string) {
    return prisma.table.findFirst({
      where: { id },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.table.findFirst({
      where: { slug: slug.toLowerCase().trim() },
    });
  }

  static async findByNumber(restaurantId: string, tableNumber: number) {
    return prisma.table.findFirst({
      where: { restaurantId, tableNumber },
    });
  }

  static async create(data: CreateTableDTO & { slug: string; qrCodeImage?: string }) {
    return prisma.table.create({
      data: {
        restaurantId: data.restaurantId,
        name: data.name.trim(),
        tableNumber: data.tableNumber,
        capacity: data.capacity ?? 2,
        zone: data.zone?.trim() || "Main Dining",
        notes: data.notes?.trim() || null,
        slug: data.slug.toLowerCase().trim(),
        qrCodeImage: data.qrCodeImage || null,
      },
    });
  }

  static async update(id: string, data: UpdateTableDTO & { slug?: string; qrCodeImage?: string }) {
    return prisma.table.update({
      where: { id },
      data: {
        ...data,
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.zone !== undefined ? { zone: data.zone?.trim() || "Main Dining" } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
        ...(data.slug ? { slug: data.slug.toLowerCase().trim() } : {}),
      },
    });
  }

  static async hardDelete(id: string) {
    return prisma.table.delete({
      where: { id },
    });
  }
}
