import { prisma } from "@/lib/prisma";

export class DashboardRepository {
  static async getDashboardCounts(restaurantId?: string) {
    const whereClause = restaurantId
      ? { restaurantId, isDeleted: false, isActive: true }
      : { isDeleted: false, isActive: true };

    const [categoryCount, menuItemCount, popularCount, chefSpecialCount] = await Promise.all([
      prisma.category.count({ where: whereClause }),
      prisma.menuItem.count({ where: whereClause }),
      prisma.menuItem.count({ where: { ...whereClause, isPopular: true } }),
      prisma.menuItem.count({ where: { ...whereClause, isChefSpecial: true } }),
    ]);

    return {
      categoryCount,
      menuItemCount,
      popularCount,
      chefSpecialCount,
    };
  }
}
