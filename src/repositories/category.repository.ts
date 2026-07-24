import { prisma } from "@/lib/prisma";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/types/dto";

export class CategoryRepository {
  static async getCategoriesByRestaurant(restaurantId: string) {
    return prisma.category.findMany({
      where: { restaurantId, isActive: true },
      orderBy: { displayOrder: "asc" },
    });
  }

  static async getAllCategoriesWithCounts(restaurantId: string) {
    return prisma.category.findMany({
      where: { restaurantId },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
    });
  }

  static async findByRestaurantId(restaurantId: string) {
    return this.getCategoriesByRestaurant(restaurantId);
  }

  static async findById(id: string) {
    return prisma.category.findFirst({
      where: { id },
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
    });
  }

  static async findByName(restaurantId: string, name: string) {
    return prisma.category.findFirst({
      where: {
        restaurantId,
        name: { equals: name.trim(), mode: "insensitive" },
      },
    });
  }

  static async create(data: CreateCategoryDTO) {
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined || displayOrder === 0) {
      const maxCategory = await prisma.category.findFirst({
        where: { restaurantId: data.restaurantId },
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });
      displayOrder = (maxCategory?.displayOrder ?? 0) + 1;
    }

    return prisma.category.create({
      data: {
        restaurantId: data.restaurantId,
        name: data.name.trim(),
        description: data.description?.trim(),
        image: data.image?.trim(),
        displayOrder,
      },
    });
  }

  static async update(id: string, data: UpdateCategoryDTO) {
    return prisma.category.update({
      where: { id },
      data: {
        ...data,
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() } : {}),
        ...(data.image !== undefined ? { image: data.image?.trim() } : {}),
      },
    });
  }

  static async hardDelete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
