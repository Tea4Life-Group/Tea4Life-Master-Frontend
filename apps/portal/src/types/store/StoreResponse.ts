import type { StoreEmployeeResponse } from "./StoreEmployeeResponse";

export interface StoreResponse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  employees: StoreEmployeeResponse[];
}
