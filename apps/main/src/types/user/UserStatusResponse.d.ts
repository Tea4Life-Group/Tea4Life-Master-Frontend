export default interface UserStatusResponse {
  userStatus: "SUCCESS" | "PROCESSING" | "NOT_FOUND";
  existed: boolean;
  onboarded: boolean;
  fullName: string | null;
  email: string | null;
  role: string | null;
  avatarUrl: string |null;
}
