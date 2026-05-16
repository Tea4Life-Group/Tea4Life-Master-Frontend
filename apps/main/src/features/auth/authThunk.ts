import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  checkUserStatusApi,
  processOnboardingApi,
  updateUserProfileApi,
  updateUserAvatarApi,
} from "@/services/userApi";
import { handleUpload } from "@/services/storageApi";
import type { OnboardingRequest } from "@/types/user/OnboardingRequest";
import type { UpdateProfileRequest } from "@/types/user/UpdateProfileRequest";
import type UserStatusResponse from "@/types/user/UserStatusResponse";

/**
 * Thunk 1: Khởi tạo trạng thái User (Dùng ở main.tsx)
 * Luồng: Gọi API check status -> Trả về data cho extraReducers cập nhật state
 */
export const initializeAuthStatus = createAsyncThunk<
  UserStatusResponse | null,
  void
>("auth/initializeStatus", async () => {
  const status = await checkUserStatusApi();
  return status;
});

/**
 * Thunk 2: Thực hiện Onboarding (Dùng ở trang Onboarding)
 * Luồng: Submit Form -> Gọi lại check status để lấy dữ liệu mới nhất từ DB
 */
export const executeOnboarding = createAsyncThunk<
  UserStatusResponse | null,
  OnboardingRequest
>("auth/executeOnboarding", async (onboardingData) => {
  await processOnboardingApi(onboardingData);
  const updatedStatus = await checkUserStatusApi();
  return updatedStatus;
});

/**
 * Thunk 3: Cập nhật Profile (Dùng ở trang Profile)
 * Luồng: Update Profile -> Check Status -> Cập nhật lại state (fullName, avatarUrl...)
 */
export const executeUpdateProfile = createAsyncThunk<
  UserStatusResponse | null,
  UpdateProfileRequest
>("auth/executeUpdateProfile", async (profileData) => {
  await updateUserProfileApi(profileData);
  const updatedStatus = await checkUserStatusApi();
  return updatedStatus;
});

/**
 * Thunk 4: Cập nhật Avatar (Dùng ở trang Profile Layout)
 * Luồng: Upload file lên S3 (presigned URL) -> Gọi API cập nhật avatarKey -> Check Status
 */
export const executeUpdateAvatar = createAsyncThunk<
  UserStatusResponse | null,
  File
>("auth/executeUpdateAvatar", async (file, { rejectWithValue }) => {
  const avatarKey = await handleUpload(file);
  if (!avatarKey) {
    return rejectWithValue("Upload ảnh thất bại");
  }

  await updateUserAvatarApi({ avatarKey });
  const updatedStatus = await checkUserStatusApi();
  return updatedStatus;
});
