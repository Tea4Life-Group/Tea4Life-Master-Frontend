import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { PresignedUrlRequest } from "@/types/storage/PresignedUrlRequest";
import type { PresignedUrlResponse } from "@/types/storage/PresignedUrlResponse";
import axios from "axios";

/**
 * Lấy Presigned URL từ Storage Service thông qua Gateway.
 */
export const getPresignedUrl = async (
  request: PresignedUrlRequest,
): Promise<ApiResponse<PresignedUrlResponse>> => {
  const response = await axiosClient.post<ApiResponse<PresignedUrlResponse>>(
    "/storage-service/storage/presigned-url",
    request,
  );
  return response.data;
};

/**
 * Upload file trực tiếp lên S3 Temp folder bằng link Presigned.
 * Sử dụng axios thuần để tránh đính kèm Bearer Token gây lỗi 403 từ S3.
 */
export const uploadFileToS3 = async (
  uploadUrl: string,
  file: File,
): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
};

/**
 * Hàm xử lý quy trình upload dành cho Frontend.
 * Luồng: Xin link -> Upload lên S3 -> Trả về objectKey để gửi cùng Form dữ liệu.
 * * @returns objectKey (string) nếu thành công, null nếu thất bại.
 */
export const handleUpload = async (file: File): Promise<string | null> => {
  try {
    const { data: presignedData } = await getPresignedUrl({
      fileName: file.name,
      contentType: file.type,
    });

    await uploadFileToS3(presignedData.uploadUrl, file);

    return presignedData.objectKey;
  } catch (error) {
    console.error("[Tea4Life] Quy trình upload temp thất bại:", error);
    return null;
  }
};
