export interface UpdateProfileRequest {
  fullName: string;

  phone: string;

  dob: string;

  gender: "MALE" | "FEMALE" | "OTHER";

}
