import * as React from "react";
import { OrderService } from "@/services";
import { OrderStatusView } from "@/components/customer/order-status-view";
import { OrderEntity } from "@/types";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({
  params,
}: {
  params: { id: string };
}) {
  let order: OrderEntity | null = null;

  try {
    const fetched = await OrderService.getOrderById(params.id);
    if (fetched) {
      order = {
        ...fetched,
        subtotal: Number(fetched.subtotal),
        taxRate: Number(fetched.taxRate),
        taxAmount: Number(fetched.taxAmount),
        serviceCharge: Number(fetched.serviceCharge),
        serviceChargeAmount: Number(fetched.serviceChargeAmount),
        totalAmount: Number(fetched.totalAmount),
        items: fetched.items?.map((item) => ({
          ...item,
          price: Number(item.price),
          totalPrice: Number(item.totalPrice),
        })),
      };
    }
  } catch {
    // Ignore fetch error
  }

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <OrderStatusView orderId={params.id} initialOrder={order} />
    </React.Suspense>
  );
}
