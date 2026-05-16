import { PermissionResponse } from "../permission/PermissionResponse";

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  permissions: PermissionResponse[];
}
