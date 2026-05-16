export interface UserResponse {
  id: string;
  keycloakId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  dob: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  roleName: string;
}
