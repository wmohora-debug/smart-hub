import { NextResponse } from "next/server";
import { MenuService } from "@/services";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updated = await MenuService.updateMenuItem(id, {
      name: body.name,
      description: body.description,
      categoryId: body.categoryId,
      price: body.price !== undefined ? Number(body.price) : undefined,
      image: body.image,
      isVeg: body.isVeg !== undefined ? Boolean(body.isVeg) : undefined,
      isChefSpecial: body.isChefSpecial !== undefined ? Boolean(body.isChefSpecial) : undefined,
      isPopular: body.isPopular !== undefined ? Boolean(body.isPopular) : undefined,
      isSoldOut: body.isSoldOut !== undefined ? Boolean(body.isSoldOut) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Menu item "${updated.name}" updated successfully`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update menu item";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { property, value } = body;

    if (!["isSoldOut", "isActive", "isVeg", "isPopular", "isChefSpecial"].includes(property)) {
      return NextResponse.json({ success: false, message: "Invalid toggle property" }, { status: 400 });
    }

    const updated = await MenuService.toggleProperty(
      id,
      property as "isSoldOut" | "isActive" | "isVeg" | "isPopular" | "isChefSpecial",
      Boolean(value),
    );

    return NextResponse.json({
      success: true,
      message: `Property "${property}" updated to ${value}`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle property";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await MenuService.hardDeleteMenuItem(id);

    return NextResponse.json({
      success: true,
      message: "Menu item removed permanently from database",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete menu item";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
