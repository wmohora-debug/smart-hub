import { NextResponse } from "next/server";
import { TableService, RestaurantService } from "@/services";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      const restaurant =
        (await RestaurantService.getRestaurant("smart-food-hub")) ||
        (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
        (await RestaurantService.getRestaurant("le-gourmet-bistro"));
      restaurantId = restaurant?.id || null;
    }

    if (!restaurantId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const tables = await TableService.getAllTables(restaurantId);
    return NextResponse.json({ success: true, data: tables });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch tables";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin authentication required." }, { status: 401 });
    }

    const body = await request.json();

    if (!body.restaurantId) {
      const restaurant =
        (await RestaurantService.getRestaurant("smart-food-hub")) ||
        (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
        (await RestaurantService.getRestaurant("le-gourmet-bistro"));
      if (restaurant) body.restaurantId = restaurant.id;
    }

    const newTable = await TableService.createTable({
      restaurantId: body.restaurantId,
      name: body.name,
      tableNumber: Number(body.tableNumber),
      capacity: body.capacity ? Number(body.capacity) : 2,
      zone: body.zone,
      notes: body.notes,
      slug: body.slug,
    });

    return NextResponse.json({
      success: true,
      message: `Table "${newTable.name}" created successfully with QR Code`,
      data: newTable,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create table";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
