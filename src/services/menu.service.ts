import { MenuRepository } from "@/repositories/menu.repository";
import { CreateMenuItemDTO, UpdateMenuItemDTO } from "@/types/dto";
import { createMenuItemSchema, updateMenuItemSchema } from "@/lib/validations/menu-item";

export class MenuService {
  static async getVisibleMenu(restaurantId: string) {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    return MenuRepository.getMenuByRestaurant(restaurantId);
  }

  static async getAllMenuItemsForAdmin(restaurantId: string) {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    return MenuRepository.getAllMenuItemsForAdmin(restaurantId);
  }

  static async getMenuItemsByRestaurant(restaurantId: string) {
    return this.getVisibleMenu(restaurantId);
  }

  static async getMenuItemsByCategory(categoryId: string) {
    if (!categoryId) throw new Error("Category ID is required");
    return MenuRepository.getMenuByCategory(categoryId);
  }

  static async searchMenu(restaurantId: string, query: string) {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    return MenuRepository.searchMenu(restaurantId, query);
  }

  static async getPopularItems(restaurantId: string) {
    const allItems = await this.getVisibleMenu(restaurantId);
    return allItems.filter((item) => item.isPopular);
  }

  static async getChefSpecials(restaurantId: string) {
    const allItems = await this.getVisibleMenu(restaurantId);
    return allItems.filter((item) => item.isChefSpecial);
  }

  static async getMenuItemById(id: string) {
    if (!id) throw new Error("Menu item ID is required");
    return MenuRepository.findById(id);
  }

  static async createMenuItem(dto: CreateMenuItemDTO) {
    const validated = createMenuItemSchema.parse(dto);

    // Duplicate dish name check per category
    const existing = await MenuRepository.findByNameInCategory(
      validated.restaurantId,
      validated.categoryId,
      validated.name,
    );
    if (existing) {
      throw new Error(`Menu item "${validated.name}" already exists in this category.`);
    }

    return MenuRepository.create(validated);
  }

  static async updateMenuItem(id: string, dto: UpdateMenuItemDTO) {
    const validated = updateMenuItemSchema.parse(dto);

    const existingItem = await MenuRepository.findById(id);
    if (!existingItem) throw new Error("Menu item not found");

    const categoryId = validated.categoryId || existingItem.categoryId;
    const name = validated.name || existingItem.name;

    if (
      (validated.name && validated.name.toLowerCase() !== existingItem.name.toLowerCase()) ||
      (validated.categoryId && validated.categoryId !== existingItem.categoryId)
    ) {
      const duplicate = await MenuRepository.findByNameInCategory(
        existingItem.restaurantId,
        categoryId,
        name,
      );
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Menu item "${name}" already exists in this category.`);
      }
    }

    return MenuRepository.update(id, validated);
  }

  static async toggleProperty(
    id: string,
    property: "isSoldOut" | "isActive" | "isVeg" | "isPopular" | "isChefSpecial",
    value: boolean,
  ) {
    return MenuRepository.update(id, { [property]: value });
  }

  static async hardDeleteMenuItem(id: string) {
    const existing = await MenuRepository.findById(id);
    if (!existing) throw new Error("Menu item not found");

    return MenuRepository.hardDelete(id);
  }

  static async softDeleteMenuItem(id: string) {
    return this.hardDeleteMenuItem(id);
  }
}
