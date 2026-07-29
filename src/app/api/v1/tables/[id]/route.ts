import { NextResponse } from "next/server";
import { TableService } from "@/services";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin authentication required." }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    if (body.regenerateQr) {
      const updated = await TableService.regenerateQRCode(id);
      return NextResponse.json({
        success: true,
        message: "QR Code regenerated successfully",
        data: updated,
      });
    }

    const updated = await TableService.updateTable(id, {
      name: body.name,
      tableNumber: body.tableNumber !== undefined ? Number(body.tableNumber) : undefined,
      capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
      zone: body.zone,
      notes: body.notes,
      slug: body.slug,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Table "${updated.name}" updated successfully`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update table";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin authentication required." }, { status: 401 });
    }

    const { id } = params;
    await TableService.hardDeleteTable(id);

    return NextResponse.json({
      success: true,
      message: "Table removed permanently from database",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete table";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
