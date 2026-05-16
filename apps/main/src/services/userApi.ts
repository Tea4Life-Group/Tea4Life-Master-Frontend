import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { OnboardingRequest } from "@/types/user/OnboardingRequest";
import type { UpdateAvatarRequest } from "@/types/user/UpdateAvatarRequest";
import type { UpdatePasswordRequest } from "@/types/user/UpdatePasswordRequest";
import type { UpdateProfileRequest } from "@/types/user/UpdateProfileRequest";
import type { UserProfileResponse } from "@/types/user/UserProfileResponse";
import type UserStatusResponse from "@/types/user/UserStatusResponse";

export const checkUserStatusApi =
  async (): Promise<UserStatusResponse | null> => {
    const MAX_RETRIES = 3;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const response = await axiosClient.get<ApiResponse<UserStatusResponse>>(
          `/user-service/users/me/exists`,
        );

        const data = response.data.data;
        if (data.userStatus === "SUCCESS") return data;

        console.log(`[Tea4Life] Đồng bộ ${data.userStatus}... lần ${i + 1}`);
      } catch (err) {
        console.error("[Tea4Life] Đồng bộ thất bại", err);
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    return null;
  };

export const processOnboardingApi = async (data: OnboardingRequest) => {
  return await axiosClient.post<ApiResponse<void>>(
    `/user-service/users/me/onboarding`,
    data,
  );
};

export const getUserProfileApi = async () => {
  return await axiosClient.get<ApiResponse<UserProfileResponse>>(
    `/user-service/users/me`
  );
};

export const updateUserProfileApi = async (data: UpdateProfileRequest) => {
  return await axiosClient.post<ApiResponse<void>>(
    `/user-service/users/me/profile`,
    data
  );
};

export const updateUserAvatarApi = async (data: UpdateAvatarRequest) => {
  return await axiosClient.post<ApiResponse<void>>(
    `/user-service/users/me/avatar`,
    data
  );
};

export const updateUserPasswordApi = async (data: UpdatePasswordRequest) => {
  return await axiosClient.post<ApiResponse<void>>(
    `/user-service/users/me/password`,
    data
  );
};