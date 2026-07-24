import { NextResponse } from "next/server";
import { RestaurantService } from "@/services";

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
      return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 });
    }

    const settings = await RestaurantService.getRestaurantSettings(restaurantId);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch restaurant settings";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let { restaurantId } = body;

    if (!restaurantId) {
      const restaurant =
        (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
        (await RestaurantService.getRestaurant("le-gourmet-bistro"));
      restaurantId = restaurant?.id;
    }

    if (!restaurantId) {
      return NextResponse.json({ success: false, message: "Restaurant ID is required" }, { status: 400 });
    }

    const updatedSettings = await RestaurantService.updateRestaurantSettings(restaurantId, {
      taxRate: Number(body.taxRate),
      serviceCharge: Number(body.serviceCharge),
      currency: body.currency,
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully in PostgreSQL",
      data: updatedSettings,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
