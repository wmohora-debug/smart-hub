"use client";

import * as React from "react";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/components/ui/toast-wrapper";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface OrderItemRecord {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  notes?: string | null;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  serviceCharge: number;
  serviceChargeAmount: number;
  totalAmount: number;
  notes?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
  table?: {
    id: string;
    name: string;
    tableNumber: number;
    zone?: string | null;
  } | null;
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  ACCEPTED: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  PREPARING: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  READY: { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/20" },
  SERVED: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  COMPLETED: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" },
  CANCELLED: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
  REJECTED: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<OrderRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");

  // Selected Order for Detail Modal
  const [activeOrder, setActiveOrder] = React.useState<OrderRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  // Delete Order State
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      params.append("limit", "50");

      const res = await fetch(`/api/v1/orders?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const formatted: OrderRecord[] = data.data.map((o: OrderRecord) => ({
          ...o,
          subtotal: Number(o.subtotal),
          taxRate: Number(o.taxRate),
          taxAmount: Number(o.taxAmount),
          serviceCharge: Number(o.serviceCharge),
          serviceChargeAmount: Number(o.serviceChargeAmount),
          totalAmount: Number(o.totalAmount),
          items: o.items.map((i: OrderItemRecord) => ({
            ...i,
            price: Number(i.price),
            totalPrice: Number(i.totalPrice),
          })),
        }));
        setOrders(formatted);
      }
    } catch {
      notify.error("Failed to load orders from database");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Analytics Metrics
  const metrics = React.useMemo(() => {
    const totalOrdersCount = orders.length;
    const completedOrders = orders.filter((o) => o.status === OrderStatus.COMPLETED);
    const activeOrders = orders.filter(
      (o) =>
        o.status !== OrderStatus.COMPLETED &&
        o.status !== OrderStatus.CANCELLED &&
        o.status !== OrderStatus.REJECTED,
    );

    const totalRevenue = orders
      .filter((o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    return {
      totalOrdersCount,
      activeOrdersCount: activeOrders.length,
      completedOrdersCount: completedOrders.length,
      totalRevenue,
      aov,
    };
  }, [orders]);

  // Handle Status Update
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update order status");
      }

      notify.success(`Order ${data.data.orderNumber} status updated to ${newStatus}`);
      if (activeOrder?.id === orderId) {
        setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      notify.error(msg);
    } fontally: {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete order");

      notify.success("Order removed permanently from database");
      if (activeOrder?.id === orderId) setActiveOrder(null);
      setDeleteTargetId(null);
      fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting order";
      notify.error(msg);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Orders Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time PostgreSQL order status workflow, KDS tracking, and sales history.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="self-start sm:self-auto gap-2"
        >
          <Icons.copy className="h-4 w-4" />
          <span>Refresh Orders</span>
        </Button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border shadow-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Orders
          </span>
          <div className="text-2xl font-bold font-serif text-foreground">
            {metrics.totalOrdersCount}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {metrics.activeOrdersCount} active in kitchen
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border shadow-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Gross Revenue
          </span>
          <div className="text-2xl font-bold font-serif text-primary">
            ₹{metrics.totalRevenue.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-muted-foreground">Active & completed sales</span>
        </div>

        <div className="p-4 rounded-xl bg-card border shadow-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Avg Order Value (AOV)
          </span>
          <div className="text-2xl font-bold font-serif text-foreground">
            ₹{Math.round(metrics.aov).toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-muted-foreground">Per completed ticket</span>
        </div>

        <div className="p-4 rounded-xl bg-card border shadow-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Completed Orders
          </span>
          <div className="text-2xl font-bold font-serif text-emerald-500">
            {metrics.completedOrdersCount}
          </div>
          <span className="text-[11px] text-muted-foreground">Served & closed</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card/60 p-3 rounded-xl border">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["ALL", ...Object.values(OrderStatus)].map((st) => (
            <Badge
              key={st}
              variant={selectedStatus === st ? "default" : "outline"}
              onClick={() => setSelectedStatus(st)}
              className="cursor-pointer text-xs px-3 py-1 font-medium whitespace-nowrap transition-all"
            >
              {st}
            </Badge>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Icons.folderOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Orders Data Table */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-muted-foreground">Loading PostgreSQL orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description="No orders match your filter criteria. Place an order on the customer site to see live ticket updates."
          variant="no-search"
        />
      ) : (
        <div className="rounded-2xl border bg-card/80 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Table / Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => {
                  const style = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-foreground font-mono">
                        {order.orderNumber}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">
                          {order.table?.name ? `${order.table.name} (${order.table.zone || "Main"})` : "Takeaway / Web"}
                        </div>
                        {order.customerName && (
                          <div className="text-[11px] text-muted-foreground">
                            {order.customerName} {order.customerPhone ? `• ${order.customerPhone}` : ""}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-muted-foreground font-medium">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                      </td>

                      <td className="px-4 py-3.5 font-serif font-bold text-foreground">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className={`${style.bg} ${style.text} ${style.border} text-[10px] font-bold px-2 py-0.5`}>
                          {order.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="secondary" className="text-[10px] font-medium">
                          {order.paymentStatus} ({order.paymentMethod || "CASH"})
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-muted-foreground text-[11px]">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={() => setActiveOrder(order)}
                        >
                          View Ticket
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDER DETAILS & STATUS TRANSITION MODAL */}
      {activeOrder && (
        <Dialog open={!!activeOrder} onOpenChange={(open) => !open && setActiveOrder(null)}>
          <DialogContent className="max-w-lg w-full p-0 overflow-hidden rounded-2xl bg-card border shadow-elevated">
            <DialogHeader className="p-5 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-serif font-bold text-foreground">
                    Ticket {activeOrder.orderNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {activeOrder.table ? `Dining at ${activeOrder.table.name} (${activeOrder.table.zone})` : "Takeaway Order"}
                  </DialogDescription>
                </div>

                <Badge
                  variant="outline"
                  className={`${STATUS_COLORS[activeOrder.status].bg} ${STATUS_COLORS[activeOrder.status].text} ${STATUS_COLORS[activeOrder.status].border} text-xs font-bold px-3 py-1`}
                >
                  {activeOrder.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Customer Details */}
              {(activeOrder.customerName || activeOrder.customerPhone || activeOrder.notes) && (
                <div className="p-3.5 rounded-xl bg-muted/30 border text-xs space-y-1">
                  {activeOrder.customerName && (
                    <p className="font-semibold text-foreground">
                      Customer: {activeOrder.customerName} {activeOrder.customerPhone ? `(${activeOrder.customerPhone})` : ""}
                    </p>
                  )}
                  {activeOrder.notes && (
                    <p className="text-muted-foreground italic">
                      Special Notes: &quot;{activeOrder.notes}&quot;
                    </p>
                  )}
                </div>
              )}

              {/* Items Breakdown Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Order Items ({activeOrder.items.length})
                </h4>

                <div className="divide-y border rounded-xl overflow-hidden bg-card/60">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-foreground">{item.name}</span>
                        <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                        {item.notes && <p className="text-[11px] text-muted-foreground italic mt-0.5">{item.notes}</p>}
                      </div>
                      <span className="font-bold text-foreground font-mono">
                        ₹{item.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">₹{activeOrder.subtotal.toLocaleString("en-IN")}</span>
                </div>
                {activeOrder.serviceCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Service Charge ({activeOrder.serviceCharge}%)</span>
                    <span className="font-semibold text-foreground">₹{activeOrder.serviceChargeAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-foreground border-t pt-2 mt-2">
                  <span>Grand Total</span>
                  <span className="text-primary font-serif text-base">₹{activeOrder.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Workflow Status Actions */}
              <div className="space-y-2 border-t pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Kitchen Workflow State
                </h4>

                <div className="flex flex-wrap items-center gap-2">
                  {activeOrder.status === OrderStatus.PENDING && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(activeOrder.id, OrderStatus.ACCEPTED)}
                      >
                        Accept Order
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(activeOrder.id, OrderStatus.REJECTED)}
                      >
                        Reject Order
                      </Button>
                    </>
                  )}

                  {activeOrder.status === OrderStatus.ACCEPTED && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(activeOrder.id, OrderStatus.PREPARING)}
                    >
                      Start Preparing
                    </Button>
                  )}

                  {activeOrder.status === OrderStatus.PREPARING && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(activeOrder.id, OrderStatus.READY)}
                    >
                      Mark Ready
                    </Button>
                  )}

                  {activeOrder.status === OrderStatus.READY && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(activeOrder.id, OrderStatus.SERVED)}
                      >
                        Mark Served
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(activeOrder.id, OrderStatus.COMPLETED)}
                      >
                        Complete Order
                      </Button>
                    </>
                  )}

                  {activeOrder.status === OrderStatus.SERVED && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(activeOrder.id, OrderStatus.COMPLETED)}
                    >
                      Complete & Close Ticket
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-muted/20 flex justify-between items-center">
              <Button
                variant="destructive"
                size="sm"
                className="text-xs"
                onClick={() => setDeleteTargetId(activeOrder.id)}
              >
                Delete Order
              </Button>

              <Button variant="outline" size="sm" onClick={() => setActiveOrder(null)}>
                Close Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <Dialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Order Purge</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this order from PostgreSQL? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteOrder(deleteTargetId)}>
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
