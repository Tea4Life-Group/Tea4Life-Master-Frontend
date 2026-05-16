export interface UpsertRoleRequest {
  name: string;
  description: string;
  permissionIdList: string[];
}
