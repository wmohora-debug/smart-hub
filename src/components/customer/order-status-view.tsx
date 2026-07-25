"use client";

import * as React from "react";
import Link from "next/link";
import { OrderEntity, OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { Icons } from "@/components/shared/icons";
import { Spinner } from "@/components/ui/spinner";

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; icon: keyof typeof Icons }> = [
  { key: OrderStatus.PENDING, label: "Order Placed", icon: "checkCircle" },
  { key: OrderStatus.ACCEPTED, label: "Accepted", icon: "checkCircle" },
  { key: OrderStatus.PREPARING, label: "Preparing", icon: "folderOpen" },
  { key: OrderStatus.READY, label: "Ready", icon: "checkCircle" },
  { key: OrderStatus.SERVED, label: "Served", icon: "checkCircle" },
  { key: OrderStatus.COMPLETED, label: "Completed", icon: "checkCircle" },
];

export interface OrderStatusViewProps {
  orderId: string;
  initialOrder?: OrderEntity | null;
}

export function OrderStatusView({ orderId, initialOrder }: OrderStatusViewProps) {
  const [order, setOrder] = React.useState<OrderEntity | null>(initialOrder || null);
  const [loading, setLoading] = React.useState(!initialOrder);
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());

  const fetchOrder = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const fetchedOrder: OrderEntity = data.data;
        setOrder(fetchedOrder);
        setLastUpdated(new Date());

        // Manage localStorage active_order_id persistence
        if (typeof window !== "undefined") {
          const terminal =
            fetchedOrder.status === OrderStatus.COMPLETED ||
            fetchedOrder.status === OrderStatus.CANCELLED ||
            fetchedOrder.status === OrderStatus.REJECTED;

          if (terminal) {
            localStorage.removeItem("active_order_id");
          } else {
            localStorage.setItem("active_order_id", fetchedOrder.id);
          }
        }
      }
    } catch {
      // Ignore polling errors
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Live polling every 5 seconds
  React.useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <Container className="max-w-xl py-16 text-center">
        <div className="p-8 rounded-2xl bg-card border shadow-subtle space-y-4">
          <Icons.info className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-serif font-bold text-foreground">Order Not Found</h2>
          <p className="text-xs text-muted-foreground">
            We could not locate order ID #{orderId}. It may have been cleared or does not exist.
          </p>
          <Link href="/">
            <Button variant="primary" size="md" className="rounded-full mt-2">
              Back to Menu
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isTerminalCancelled = order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REJECTED;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <Container className="max-w-2xl space-y-6">
        {/* Top Order Success Banner */}
        <div className="p-6 rounded-2xl bg-card border shadow-elevated text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
            <Icons.checkCircle className="h-7 w-7" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-0.5">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Thank you! Your order has been received by the kitchen.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
            {order.table && (
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-semibold text-xs py-1 px-3">
                📍 {order.table.name} ({order.table.zone || "Main Dining"})
              </Badge>
            )}

            <Badge variant="secondary" className="text-xs py-1 px-3">
              Est. Time: 15-20 min
            </Badge>

            <span className="text-[10px] text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Live Order Status Stepper */}
        <div className="p-6 rounded-2xl bg-card border shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-foreground">Live Order Progress</h3>
            <Badge
              variant={isTerminalCancelled ? "destructive" : "default"}
              className="text-xs font-semibold px-2.5 py-0.5"
            >
              {order.status}
            </Badge>
          </div>

          {isTerminalCancelled ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
              <p className="font-bold">This order was {order.status.toLowerCase()}.</p>
              {order.cancellationReason && <p>Reason: {order.cancellationReason}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStatusIndex >= 0 && idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-1.5">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 ring-4 ring-primary/20 scale-110"
                          : isPassed
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground border"
                      }`}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </div>
                    <span className={`text-[10px] font-semibold ${isPassed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Items Breakdown */}
        <div className="p-6 rounded-2xl bg-card border shadow-subtle space-y-4">
          <h3 className="text-sm font-serif font-bold text-foreground">Items Ordered</h3>

          <div className="divide-y text-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                  {item.notes && <p className="text-[11px] text-muted-foreground italic mt-0.5">{item.notes}</p>}
                </div>
                <span className="font-bold text-foreground">
                  ₹{Number(item.totalPrice).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
            </div>
            {Number(order.serviceCharge) > 0 && (
              <div className="flex justify-between">
                <span>Service Charge ({Number(order.serviceCharge)}%)</span>
                <span className="font-semibold text-foreground">₹{Number(order.serviceChargeAmount).toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-foreground border-t pt-2 mt-2">
              <span>Grand Total</span>
              <span className="text-primary font-serif text-base">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button variant="primary" size="md" className="rounded-full px-8 shadow-md font-semibold gap-2">
              <Icons.chevronRight className="h-4 w-4 rotate-180" />
              <span>Continue Browsing Menu</span>
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
