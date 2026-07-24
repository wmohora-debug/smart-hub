import { NextResponse } from "next/server";
import { CategoryService } from "@/services";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updated = await CategoryService.updateCategory(id, {
      name: body.name,
      description: body.description,
      image: body.image,
      displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Category "${updated.name}" updated successfully`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update category";
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

    const updated = await CategoryService.toggleCategoryStatus(id, Boolean(body.isActive));

    return NextResponse.json({
      success: true,
      message: `Category status set to ${updated.isActive ? "Active" : "Inactive"}`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update category status";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await CategoryService.hardDeleteCategory(id);

    return NextResponse.json({
      success: true,
      message: "Category removed permanently from database",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
