import { SettingsRepository } from "@/repositories/settings.repository";
import { CreateSettingsDTO, UpdateSettingsDTO } from "@/types/dto";
import { createSettingsSchema, updateSettingsSchema } from "@/lib/validations/settings";

export class SettingsService {
  static async getSettingsByRestaurant(restaurantId: string) {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    return SettingsRepository.findByRestaurantId(restaurantId);
  }

  static async createSettings(dto: CreateSettingsDTO) {
    const validated = createSettingsSchema.parse(dto);
    return SettingsRepository.create(validated);
  }

  static async updateSettings(restaurantId: string, dto: UpdateSettingsDTO) {
    const validated = updateSettingsSchema.parse(dto);
    return SettingsRepository.update(restaurantId, validated);
  }
}
