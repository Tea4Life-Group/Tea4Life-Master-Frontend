export interface OrderItemOptionRequest {
  productOptionId: string;
  productOptionName: string;
  productOptionValueId: string;
  productOptionValueName: string;
  extraPrice: number;
}

export interface OrderItemRequest {
  productId: string;
  productName: string;
  productImageUrl?: string;
  selectedOptions?: OrderItemOptionRequest[];
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderRequest {
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  latitude?: number;
  longitude?: number;
  paymentMethod: "COD" | "BANKING";
  voucherCode?: string;
  items: OrderItemRequest[];
}
