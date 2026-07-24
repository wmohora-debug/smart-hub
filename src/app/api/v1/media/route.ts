import { NextResponse } from "next/server";
import { MediaService, RestaurantService } from "@/services";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "all";
    const query = searchParams.get("query") || "";
    let restaurantId: string | null = searchParams.get("restaurantId");

    if (!restaurantId) {
      const restaurant =
        (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
        (await RestaurantService.getRestaurant("le-gourmet-bistro"));
      restaurantId = restaurant?.id || null;
    }

    const assets = await MediaService.getMediaLibrary(
      restaurantId || undefined,
      folder,
      query,
    );
    return NextResponse.json({ success: true, data: assets });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch media assets";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    let restaurantId: string | null = formData.get("restaurantId") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    if (!restaurantId) {
      const restaurant =
        (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
        (await RestaurantService.getRestaurant("le-gourmet-bistro"));
      restaurantId = restaurant?.id || null;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const asset = await MediaService.uploadFile(
      buffer,
      file.name,
      file.type,
      folder,
      restaurantId || undefined,
    );

    return NextResponse.json({
      success: true,
      message: `Image "${asset.filename}" uploaded successfully`,
      data: asset,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
