export interface CheckoutOrderRequest {
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  latitude?: number;
  longitude?: number;
  paymentMethod: "COD" | "BANKING";
  voucherCode?: string | null;
}
