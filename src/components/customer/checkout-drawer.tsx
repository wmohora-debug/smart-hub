"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MenuItemEntity, RestaurantEntity } from "@/types";
import { useTable } from "@/context/table-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { notify } from "@/components/ui/toast-wrapper";

export interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Record<string, number>;
  dishes: MenuItemEntity[];
  restaurant?: RestaurantEntity | null;
  onIncrement: (dishId: string) => void;
  onDecrement: (dishId: string) => void;
  onClearCart: () => void;
}

export function CheckoutDrawer({
  isOpen,
  onClose,
  cartItems,
  dishes,
  restaurant,
  onIncrement,
  onDecrement,
  onClearCart,
}: CheckoutDrawerProps) {
  const router = useRouter();
  const { isTableSelected, tableName, zone, tableId } = useTable();

  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [orderNotes, setOrderNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Filter items in cart
  const cartEntries = React.useMemo(() => {
    return Object.entries(cartItems)
      .map(([dishId, quantity]) => {
        const dish = dishes.find((d) => d.id === dishId);
        return dish ? { dish, quantity } : null;
      })
      .filter((entry): entry is { dish: MenuItemEntity; quantity: number } => entry !== null);
  }, [cartItems, dishes]);

  // Financial Calculations (NO GST / Tax)
  const serviceCharge = restaurant?.settings?.serviceCharge ?? 0;

  const subtotal = React.useMemo(() => {
    return cartEntries.reduce((sum, item) => sum + Number(item.dish.price) * item.quantity, 0);
  }, [cartEntries]);

  const serviceChargeAmount = Math.round((subtotal * (serviceCharge / 100) + Number.EPSILON) * 100) / 100;
  const grandTotal = Math.round((subtotal + serviceChargeAmount + Number.EPSILON) * 100) / 100;

  const handlePlaceOrder = async () => {
    if (cartEntries.length === 0) return;
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const payload = {
        restaurantId: restaurant?.id,
        tableId: tableId || undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        notes: orderNotes.trim() || undefined,
        items: cartEntries.map((item) => ({
          menuItemId: item.dish.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit order. Please try again.");
      }

      // Save active order ID to localStorage for customer status tracking
      if (typeof window !== "undefined") {
        localStorage.setItem("active_order_id", data.data.id);
      }

      notify.success(`Order ${data.data.orderNumber} placed successfully!`);
      onClearCart();
      onClose();

      // Navigate to Live Order Status Page
      router.push(`/order-status/${data.data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      notify.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-card border-border shadow-elevated">
        <DialogHeader className="p-4 sm:p-5 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-serif font-bold text-foreground">
                Your Table Order
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {restaurant?.name || "Smart Food Hub"}
              </DialogDescription>
            </div>

            {isTableSelected ? (
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-semibold text-xs py-1 px-3">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                {tableName} ({zone || "Main Dining"})
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Dine-In
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable Order Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Item List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Selected Dishes ({cartEntries.reduce((sum, i) => sum + i.quantity, 0)})
            </h4>

            {cartEntries.map(({ dish, quantity }) => (
              <div
                key={dish.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-card/60"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border bg-muted">
                    {dish.image ? (
                      <Image src={dish.image} alt={dish.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-accent/40 text-xs font-bold">
                        {dish.name[0]}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                      {dish.name}
                    </h5>
                    <p className="text-xs text-primary font-bold mt-0.5">
                      ₹{Number(dish.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Quantity Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-xs"
                    onClick={() => onDecrement(dish.id)}
                  >
                    -
                  </Button>
                  <span className="w-5 text-center text-xs font-bold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-xs"
                    onClick={() => onIncrement(dish.id)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Details Form */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Customer Details (Optional)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="customerName" className="text-xs">Your Name</Label>
                <Input
                  id="customerName"
                  placeholder="e.g. Tashi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone" className="text-xs">Phone Number</Label>
                <Input
                  id="customerPhone"
                  placeholder="e.g. +91 98000..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="orderNotes" className="text-xs">Special Instructions</Label>
              <Textarea
                id="orderNotes"
                placeholder="e.g. Extra spicy, no cutlery required..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          {/* Bill Summary Breakdown (NO GST) */}
          <div className="space-y-2 border-t pt-4 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Payment Breakdown
            </h4>

            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            {serviceCharge > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service Charge ({serviceCharge}%)</span>
                <span className="font-semibold text-foreground">₹{serviceChargeAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold text-foreground border-t pt-2 mt-2">
              <span>Grand Total</span>
              <span className="text-primary font-serif text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-5 border-t bg-muted/20 flex flex-row items-center gap-3">
          <Button variant="outline" size="md" className="flex-1 rounded-xl" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            disabled={isSubmitting || cartEntries.length === 0}
            className="flex-1 rounded-xl font-semibold shadow-md shadow-primary/25"
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Placing Order...</span>
              </div>
            ) : (
              <span>Confirm & Place Order</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
