export type AddressType = "HOME" | "OFFICE" | "OTHER";

export interface CreateAddressRequest {
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  latitude: number;
  longitude: number;
  addressType: AddressType;
  isDefault: boolean;
}
