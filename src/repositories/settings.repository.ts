import { prisma } from "@/lib/prisma";
import { CreateSettingsDTO, UpdateSettingsDTO } from "@/types/dto";

export class SettingsRepository {
  static async findByRestaurantId(restaurantId: string) {
    return prisma.restaurantSettings.findUnique({
      where: { restaurantId },
    });
  }

  static async create(data: CreateSettingsDTO) {
    return prisma.restaurantSettings.create({
      data: {
        restaurantId: data.restaurantId,
        taxRate: data.taxRate ?? 5.0,
        serviceCharge: data.serviceCharge ?? 0.0,
        currency: data.currency ?? "INR",
        themeConfig: data.themeConfig ?? undefined,
        brandingJson: data.brandingJson ?? undefined,
      },
    });
  }

  static async update(restaurantId: string, data: UpdateSettingsDTO) {
    return prisma.restaurantSettings.update({
      where: { restaurantId },
      data,
    });
  }
}
