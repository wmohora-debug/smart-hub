import { prisma } from "@/lib/prisma";
import { CreateMenuItemDTO, UpdateMenuItemDTO } from "@/types/dto";

export class MenuRepository {
  static async getMenuByRestaurant(restaurantId: string) {
    return prisma.menuItem.findMany({
      where: { restaurantId, isActive: true },
      orderBy: [{ categoryId: "asc" }, { displayOrder: "asc" }],
      include: { category: true },
    });
  }

  static async getAllMenuItemsForAdmin(restaurantId: string) {
    return prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: [{ categoryId: "asc" }, { displayOrder: "asc" }],
      include: { category: true },
    });
  }

  static async findByRestaurantId(restaurantId: string) {
    return this.getMenuByRestaurant(restaurantId);
  }

  static async getMenuByCategory(categoryId: string) {
    return prisma.menuItem.findMany({
      where: { categoryId, isActive: true },
      orderBy: { displayOrder: "asc" },
      include: { category: true },
    });
  }

  static async findByCategoryId(categoryId: string) {
    return this.getMenuByCategory(categoryId);
  }

  static async searchMenu(restaurantId: string, query: string) {
    const trimmed = query.trim();
    if (!trimmed) return this.getMenuByRestaurant(restaurantId);

    return prisma.menuItem.findMany({
      where: {
        restaurantId,
        isActive: true,
        OR: [
          { name: { contains: trimmed, mode: "insensitive" } },
          { description: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      orderBy: { displayOrder: "asc" },
      include: { category: true },
    });
  }

  static async findById(id: string) {
    return prisma.menuItem.findFirst({
      where: { id },
      include: { category: true },
    });
  }

  static async findByNameInCategory(restaurantId: string, categoryId: string, name: string) {
    return prisma.menuItem.findFirst({
      where: {
        restaurantId,
        categoryId,
        name: { equals: name.trim(), mode: "insensitive" },
      },
    });
  }

  static async create(data: CreateMenuItemDTO) {
    return prisma.menuItem.create({
      data: {
        restaurantId: data.restaurantId,
        categoryId: data.categoryId,
        name: data.name.trim(),
        description: data.description.trim(),
        price: data.price,
        image: data.image || "/images/food-placeholder.png",
        isVeg: data.isVeg ?? true,
        isChefSpecial: data.isChefSpecial ?? false,
        isPopular: data.isPopular ?? false,
        isSoldOut: data.isSoldOut ?? false,
        displayOrder: data.displayOrder ?? 0,
      },
      include: { category: true },
    });
  }

  static async update(id: string, data: UpdateMenuItemDTO) {
    return prisma.menuItem.update({
      where: { id },
      data: {
        ...data,
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description.trim() } : {}),
      },
      include: { category: true },
    });
  }

  static async hardDelete(id: string) {
    return prisma.menuItem.delete({
      where: { id },
    });
  }
}
