import { prisma } from "@/lib/prisma";
import { CreateRestaurantDTO, UpdateRestaurantDTO, UpdateSettingsDTO } from "@/types/dto";

export class RestaurantRepository {
  static async findById(id: string) {
    return prisma.restaurant.findFirst({
      where: { id, isDeleted: false },
      include: { settings: true },
    });
  }

  static async getRestaurantBySlug(slug: string) {
    return prisma.restaurant.findFirst({
      where: { slug, isDeleted: false, isActive: true },
      include: { settings: true },
    });
  }

  static async findBySlug(slug: string) {
    return this.getRestaurantBySlug(slug);
  }

  static async getRestaurantSettings(restaurantId: string) {
    return prisma.restaurantSettings.findUnique({
      where: { restaurantId },
    });
  }

  static async create(data: CreateRestaurantDTO) {
    return prisma.restaurant.create({
      data: {
        slug: data.slug,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        longDescription: data.longDescription,
        logo: data.logo,
        banner: data.banner,
        favicon: data.favicon,
        themeColor: data.themeColor || "#D97706",
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        website: data.website,
        openingTime: data.openingTime || "10:00 AM",
        closingTime: data.closingTime || "10:30 PM",
        autoOpen: data.autoOpen ?? true,
        isOverrideClosed: data.isOverrideClosed ?? false,
        prepTime: data.prepTime || "15-20 min",
        deliveryTime: data.deliveryTime || "30-45 min",
        facebookUrl: data.facebookUrl,
        instagramUrl: data.instagramUrl,
        twitterUrl: data.twitterUrl,
        youtubeUrl: data.youtubeUrl,
        googleMapsUrl: data.googleMapsUrl,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        currency: data.currency ?? "INR",
        timezone: data.timezone ?? "Asia/Kolkata",
        openingHours: data.openingHours ?? undefined,
        theme: data.theme ?? undefined,
      },
      include: { settings: true },
    });
  }

  static async update(id: string, data: UpdateRestaurantDTO) {
    return prisma.restaurant.update({
      where: { id },
      data,
      include: { settings: true },
    });
  }

  static async updateSettings(restaurantId: string, data: UpdateSettingsDTO) {
    return prisma.restaurantSettings.upsert({
      where: { restaurantId },
      update: {
        ...(data.taxRate !== undefined ? { taxRate: data.taxRate } : {}),
        ...(data.serviceCharge !== undefined ? { serviceCharge: data.serviceCharge } : {}),
        ...(data.currency ? { currency: data.currency } : {}),
      },
      create: {
        restaurantId,
        taxRate: data.taxRate ?? 5.0,
        serviceCharge: data.serviceCharge ?? 0.0,
        currency: data.currency ?? "INR",
      },
    });
  }

  static async softDelete(id: string) {
    return prisma.restaurant.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }
}
