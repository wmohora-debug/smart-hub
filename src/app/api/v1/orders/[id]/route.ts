import { NextResponse } from "next/server";
import { OrderService } from "@/services";

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
