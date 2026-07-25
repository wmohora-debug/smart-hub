import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";

export { OrderStatus, PaymentStatus };

export interface RestaurantEntity {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  longDescription?: string | null;
  logo?: string | null;
  banner?: string | null;
  favicon?: string | null;
  themeColor?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  autoOpen?: boolean;
  isOverrideClosed?: boolean;
  prepTime?: string | null;
  deliveryTime?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  googleMapsUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  currency: string;
  timezone: string;
  openingHours?: Prisma.JsonValue | null;
  theme?: Prisma.JsonValue | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings?: RestaurantSettingsEntity | null;
}

export interface CategoryEntity {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  image?: string | null;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemEntity {
  id: string;
  restaurantId: string;
  categoryId: string;
  category?: CategoryEntity | string;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  isVeg: boolean;
  isChefSpecial: boolean;
  isPopular: boolean;
  isSoldOut: boolean;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TableEntity {
  id: string;
  restaurantId: string;
  name: string;
  tableNumber: number;
  capacity: number;
  zone?: string | null;
  notes?: string | null;
  slug: string;
  qrCodeImage?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserEntity {
  id: string;
  restaurantId?: string | null;
  email: string;
  role: "SUPER_ADMIN" | "RESTAURANT_OWNER" | "MANAGER" | "STAFF";
  isActive: boolean;
  isDeleted: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantSettingsEntity {
  id: string;
  restaurantId: string;
  taxRate: number;
  serviceCharge: number;
  currency: string;
  themeConfig?: Prisma.JsonValue | null;
  brandingJson?: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogEntity {
  id: string;
  restaurantId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.JsonValue | null;
  createdAt: Date;
}

export interface OrderItemEntity {
  id: string;
  orderId: string;
  menuItemId?: string | null;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  notes?: string | null;
  createdAt: Date;
}

export interface OrderEntity {
  id: string;
  restaurantId: string;
  tableId?: string | null;
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
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemEntity[];
  table?: {
    id: string;
    name: string;
    tableNumber: number;
    zone?: string | null;
  } | null;
}

export interface CartItem {
  dishId: string;
  quantity: number;
}

export interface OrderSummary {
  totalItems: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
}

export * from "./dto";
