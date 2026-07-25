import { NextResponse } from "next/server";
import { CategoryService, RestaurantService } from "@/services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      const restaurant =
        (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
        (await RestaurantService.getRestaurant("le-gourmet-bistro"));
      restaurantId = restaurant?.id || null;
    }

    if (!restaurantId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const categories = await CategoryService.getAllCategoriesWithCounts(restaurantId);
    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.restaurantId) {
      const restaurant =
        (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
        (await RestaurantService.getRestaurant("le-gourmet-bistro"));
      if (restaurant) body.restaurantId = restaurant.id;
    }

    const newCategory = await CategoryService.createCategory({
      restaurantId: body.restaurantId,
      name: body.name,
      description: body.description,
      image: body.image,
      displayOrder: body.displayOrder ? Number(body.displayOrder) : 0,
    });

    return NextResponse.json({
      success: true,
      message: `Category "${newCategory.name}" created successfully`,
      data: newCategory,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
