export interface UserProfileResponse {
  fullName: string;

  phone: string;

  dob: string;

  gender: "MALE" | "FEMALE" | "OTHER";

  avatarUrl: string;

  id: string;
}
