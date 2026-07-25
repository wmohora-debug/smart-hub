import { Prisma, OrderStatus } from "@prisma/client";

export interface CreateRestaurantDTO {
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  longDescription?: string;
  logo?: string;
  banner?: string;
  favicon?: string;
  themeColor?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  openingTime?: string;
  closingTime?: string;
  autoOpen?: boolean;
  isOverrideClosed?: boolean;
  prepTime?: string;
  deliveryTime?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  googleMapsUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  currency?: string;
  timezone?: string;
  openingHours?: Prisma.InputJsonValue;
  theme?: Prisma.InputJsonValue;
}

export type UpdateRestaurantDTO = Partial<Omit<CreateRestaurantDTO, "slug">> & {
  isActive?: boolean;
};

export interface CreateCategoryDTO {
  restaurantId: string;
  name: string;
  description?: string;
  image?: string;
  displayOrder?: number;
}

export type UpdateCategoryDTO = Partial<Omit<CreateCategoryDTO, "restaurantId">> & {
  isActive?: boolean;
};

export interface CreateMenuItemDTO {
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isVeg?: boolean;
  isChefSpecial?: boolean;
  isPopular?: boolean;
  isSoldOut?: boolean;
  displayOrder?: number;
}

export type UpdateMenuItemDTO = Partial<Omit<CreateMenuItemDTO, "restaurantId">> & {
  categoryId?: string;
  isActive?: boolean;
};

export interface CreateSettingsDTO {
  restaurantId: string;
  taxRate?: number;
  serviceCharge?: number;
  currency?: string;
  themeConfig?: Prisma.InputJsonValue;
  brandingJson?: Prisma.InputJsonValue;
}

export type UpdateSettingsDTO = Partial<Omit<CreateSettingsDTO, "restaurantId">>;

export interface CreateMediaAssetDTO {
  restaurantId?: string;
  filename: string;
  url: string;
  folder: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface CreateTableDTO {
  restaurantId: string;
  name: string;
  tableNumber: number;
  capacity?: number;
  zone?: string;
  notes?: string;
  slug?: string;
  qrCodeImage?: string;
}

export type UpdateTableDTO = Partial<Omit<CreateTableDTO, "restaurantId">> & {
  isActive?: boolean;
};

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderDTO {
  restaurantId: string;
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  notes?: string;
  items: CreateOrderItemInput[];
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  cancellationReason?: string;
}

export interface OrderFilterDTO {
  restaurantId?: string;
  tableId?: string;
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
