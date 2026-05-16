export interface OnboardingRequest {
  fullName: string;

  phone: string;

  dob: string;

  gender: "MALE" | "FEMALE" | "OTHER";

  avatarKey: string;
}
