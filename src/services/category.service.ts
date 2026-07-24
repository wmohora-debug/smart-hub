import { CategoryRepository } from "@/repositories/category.repository";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/types/dto";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations/category";

export class CategoryService {
  static async getVisibleCategories(restaurantId: string) {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    return CategoryRepository.getCategoriesByRestaurant(restaurantId);
  }

  static async getAllCategoriesWithCounts(restaurantId: string) {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    return CategoryRepository.getAllCategoriesWithCounts(restaurantId);
  }

  static async getCategoriesByRestaurant(restaurantId: string) {
    return this.getVisibleCategories(restaurantId);
  }

  static async getCategoryById(id: string) {
    if (!id) throw new Error("Category ID is required");
    return CategoryRepository.findById(id);
  }

  static async createCategory(dto: CreateCategoryDTO) {
    const validated = createCategorySchema.parse(dto);

    // Duplicate name check per restaurant
    const existing = await CategoryRepository.findByName(validated.restaurantId, validated.name);
    if (existing) {
      throw new Error(`Category "${validated.name}" already exists for this restaurant.`);
    }

    return CategoryRepository.create(validated);
  }

  static async updateCategory(id: string, dto: UpdateCategoryDTO) {
    const validated = updateCategorySchema.parse(dto);

    const category = await CategoryRepository.findById(id);
    if (!category) throw new Error("Category not found");

    if (validated.name && validated.name.toLowerCase() !== category.name.toLowerCase()) {
      const existing = await CategoryRepository.findByName(category.restaurantId, validated.name);
      if (existing && existing.id !== id) {
        throw new Error(`Category "${validated.name}" already exists for this restaurant.`);
      }
    }

    return CategoryRepository.update(id, validated);
  }

  static async toggleCategoryStatus(id: string, isActive: boolean) {
    return CategoryRepository.update(id, { isActive });
  }

  static async hardDeleteCategory(id: string) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw new Error("Category not found");

    const itemCount = category._count?.menuItems ?? 0;
    if (itemCount > 0) {
      throw new Error(
        `Cannot delete "${category.name}". It contains ${itemCount} active menu item(s). Please reassign or delete its menu items first.`
      );
    }

    return CategoryRepository.hardDelete(id);
  }

  static async softDeleteCategory(id: string) {
    return this.hardDeleteCategory(id);
  }
}
