// ============================================================
// Customer Order DTOs
// ============================================================

export interface OrderItemOptionResponse {
  productOptionId: string;
  productOptionName: string;
  productOptionValueId: string;
  productOptionValueName: string;
  extraPrice: number;
}

export interface OrderItemResponse {
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  selectedOptions: OrderItemOptionResponse[];
  unitPrice: number;
  quantity: number;
}

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY_FOR_DELIVERY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "BANKING";
export type PaymentStatus = "PENDING" | "COMPLETED" | "CANCELED";

export interface OrderResponse {
  id: string;
  orderCode: string;
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  storeId?: string | null;
  storeName?: string | null;
  status: OrderStatus;
  priceBeforeDiscount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  note?: string | null;
  createdAt: string;
  items: OrderItemResponse[];
  checkoutUrl?: string | null; // PayOS payment link (only when paymentMethod === "BANKING")
}

// ============================================================
// Store Order DTOs
// ============================================================

export interface StoreOrderItemResponse {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface StoreOrderResponse {
  id: string;
  orderCode: string;
  storeId: string;
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  keycloakId: string;
  status: OrderStatus;
  note?: string | null;
  priceBeforeDiscount: number;
  finalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: StoreOrderItemResponse[];
}

// ============================================================
// Driver / Delivery Order DTOs
// ============================================================

export interface DeliveryOrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface DeliveryOrderResponse {
  id: string;
  orderCode: string;
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  storeId?: string | null;
  storeName?: string | null;
  storeAddress?: string | null;
  driverKeycloakId?: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  items: DeliveryOrderItemResponse[];
}

export interface DriverLocationResponse {
  id?: string | null;
  orderId?: string | null;
  driverKeycloakId?: string | null;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  recordedAt?: string | null;
}
