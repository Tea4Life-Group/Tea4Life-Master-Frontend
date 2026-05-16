import { AddressType } from "./CreateAddressRequest";

export interface AddressResponse {
  id: string;
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
