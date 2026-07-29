import { NextResponse } from "next/server";
import { OrderService, RestaurantService } from "@/services";
import { OrderStatus } from "@prisma/client";

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
      if (!restaurant) {
        return NextResponse.json({ success: false, message: "No active restaurant found" }, { status: 404 });
      }
      restaurantId = restaurant.id;
    }

    const tableId = searchParams.get("tableId") || undefined;
    const statusParam = searchParams.get("status") as OrderStatus | null;
    const status = statusParam && Object.values(OrderStatus).includes(statusParam) ? statusParam : undefined;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await OrderService.getAllOrders(restaurantId, {
      status,
      tableId,
      search,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let restaurantId = body.restaurantId;
    if (!restaurantId) {
      const restaurant =
        (await RestaurantService.getRestaurant("smart-food-hub")) ||
        (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
        (await RestaurantService.getRestaurant("le-gourmet-bistro"));
      if (!restaurant) {
        return NextResponse.json({ success: false, message: "No active restaurant found" }, { status: 400 });
      }
      restaurantId = restaurant.id;
    }

    const newOrder = await OrderService.createOrder({
      ...body,
      restaurantId,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Order ${newOrder.orderNumber} created successfully`,
        data: newOrder,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
