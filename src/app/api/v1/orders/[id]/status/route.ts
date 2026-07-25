import { NextResponse } from "next/server";
import { OrderService } from "@/services";
import { OrderStatus } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, cancellationReason } = body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid order status. Allowed values: ${Object.values(OrderStatus).join(", ")}`,
        },
        { status: 400 },
      );
    }

    const updatedOrder = await OrderService.updateOrderStatus(
      id,
      status as OrderStatus,
      cancellationReason,
    );

    return NextResponse.json({
      success: true,
      message: `Order ${updatedOrder.orderNumber} status updated to ${updatedOrder.status}`,
      data: updatedOrder,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update order status";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
