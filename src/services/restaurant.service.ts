import { RestaurantRepository } from "@/repositories/restaurant.repository";
import { CreateRestaurantDTO, UpdateRestaurantDTO, UpdateSettingsDTO } from "@/types/dto";
import { createRestaurantSchema, updateRestaurantSchema } from "@/lib/validations/restaurant";
import { updateSettingsSchema } from "@/lib/validations/settings";

export class RestaurantService {
  static async getRestaurant(slug: string) {
    if (!slug) throw new Error("Restaurant slug is required");
    return RestaurantRepository.getRestaurantBySlug(slug);
  }

  static async getRestaurantBySlug(slug: string) {
    return this.getRestaurant(slug);
  }

  static async getRestaurantById(id: string) {
    if (!id) throw new Error("Restaurant ID is required");
    return RestaurantRepository.findById(id);
  }

  static async createRestaurant(dto: CreateRestaurantDTO) {
    const validated = createRestaurantSchema.parse(dto);
    return RestaurantRepository.create(validated);
  }

  static async updateRestaurant(id: string, dto: UpdateRestaurantDTO) {
    const validated = updateRestaurantSchema.parse(dto);
    return RestaurantRepository.update(id, validated);
  }

  static async getRestaurantSettings(restaurantId: string) {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    return RestaurantRepository.getRestaurantSettings(restaurantId);
  }

  static async updateRestaurantSettings(restaurantId: string, dto: UpdateSettingsDTO) {
    const validated = updateSettingsSchema.parse(dto);
    return RestaurantRepository.updateSettings(restaurantId, validated);
  }

  static async softDeleteRestaurant(id: string) {
    return RestaurantRepository.softDelete(id);
  }
}
