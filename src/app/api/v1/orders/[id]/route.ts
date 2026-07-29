import { NextResponse } from "next/server";
import { OrderService } from "@/services";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const order = await OrderService.getOrderById(id);

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch order";
    return NextResponse.json({ success: false, message }, { status: 404 });
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
    await OrderService.deleteOrder(id);

    return NextResponse.json({
      success: true,
      message: "Order removed permanently from database",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete order";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
