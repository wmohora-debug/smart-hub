import * as React from "react";
import { RestaurantService, CategoryService, MenuService } from "@/services";
import { CustomerMenuShell } from "@/components/customer";
import { CategoryEntity, MenuItemEntity, RestaurantEntity } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomerPage() {
  let restaurant: RestaurantEntity | null = null;
  let categories: CategoryEntity[] = [];
  let dishes: MenuItemEntity[] = [];

  try {
    const fetchedRestaurant =
      (await RestaurantService.getRestaurant("smart-food-hub")) ||
      (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
      (await RestaurantService.getRestaurant("le-gourmet-bistro"));

    if (fetchedRestaurant) {
      restaurant = {
        ...fetchedRestaurant,
        settings: fetchedRestaurant.settings
          ? {
              ...fetchedRestaurant.settings,
              taxRate: Number(fetchedRestaurant.settings.taxRate),
              serviceCharge: Number(fetchedRestaurant.settings.serviceCharge),
            }
          : null,
      };

      const fetchedCategories = await CategoryService.getVisibleCategories(fetchedRestaurant.id);
      const fetchedDishes = await MenuService.getVisibleMenu(fetchedRestaurant.id);

      if (fetchedCategories && fetchedCategories.length > 0) {
        categories = fetchedCategories;
      }

      if (fetchedDishes && fetchedDishes.length > 0) {
        dishes = fetchedDishes.map((d) => ({
          ...d,
          price: Number(d.price),
        }));
      }
    }
  } catch (error) {
    console.error("Failed to fetch customer menu data from PostgreSQL database:", error);
  }

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CustomerMenuShell
        initialRestaurant={restaurant}
        initialCategories={categories}
        initialDishes={dishes}
      />
    </React.Suspense>
  );
}
