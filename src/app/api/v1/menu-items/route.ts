import { NextResponse } from "next/server";
import { MenuService, RestaurantService } from "@/services";

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

    const menuItems = await MenuService.getAllMenuItemsForAdmin(restaurantId);
    return NextResponse.json({ success: true, data: menuItems });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch menu items";
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

    const newItem = await MenuService.createMenuItem({
      restaurantId: body.restaurantId,
      categoryId: body.categoryId,
      name: body.name,
      description: body.description,
      price: Number(body.price),
      image: body.image || "/images/food-placeholder.png",
      isVeg: body.isVeg !== undefined ? Boolean(body.isVeg) : true,
      isChefSpecial: Boolean(body.isChefSpecial),
      isPopular: Boolean(body.isPopular),
      isSoldOut: Boolean(body.isSoldOut),
      displayOrder: body.displayOrder ? Number(body.displayOrder) : 0,
    });

    return NextResponse.json({
      success: true,
      message: `Menu item "${newItem.name}" created successfully`,
      data: newItem,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create menu item";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
