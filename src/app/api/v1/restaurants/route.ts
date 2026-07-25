import { NextResponse } from "next/server";
import { RestaurantService } from "@/services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "smart-tech-food-hub";

    let restaurant = await RestaurantService.getRestaurant(slug);
    if (!restaurant) {
      restaurant = await RestaurantService.getRestaurant("le-gourmet-bistro");
    }

    if (!restaurant) {
      return NextResponse.json({ success: false, message: "Restaurant profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: restaurant });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch restaurant profile";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let { id } = body;

    if (!id) {
      const restaurant =
        (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
        (await RestaurantService.getRestaurant("le-gourmet-bistro"));
      id = restaurant?.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "Restaurant ID is required" }, { status: 400 });
    }

    const updated = await RestaurantService.updateRestaurant(id, {
      name: body.name,
      tagline: body.tagline,
      description: body.description,
      longDescription: body.longDescription,
      logo: body.logo,
      banner: body.banner,
      favicon: body.favicon,
      themeColor: body.themeColor,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      postalCode: body.postalCode,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,
      website: body.website,
      openingTime: body.openingTime,
      closingTime: body.closingTime,
      autoOpen: body.autoOpen !== undefined ? Boolean(body.autoOpen) : undefined,
      isOverrideClosed: body.isOverrideClosed !== undefined ? Boolean(body.isOverrideClosed) : undefined,
      prepTime: body.prepTime,
      deliveryTime: body.deliveryTime,
      facebookUrl: body.facebookUrl,
      instagramUrl: body.instagramUrl,
      twitterUrl: body.twitterUrl,
      youtubeUrl: body.youtubeUrl,
      googleMapsUrl: body.googleMapsUrl,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      keywords: body.keywords,
      currency: body.currency,
      timezone: body.timezone,
    });

    return NextResponse.json({
      success: true,
      message: "Restaurant profile updated successfully in PostgreSQL",
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update restaurant profile";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
