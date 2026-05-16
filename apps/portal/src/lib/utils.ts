import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MEDIA_BASE_URL = "https://media.tea4life.click/";

/**
 * Nối base URL của CDN media vào đường dẫn tương đối (VD: avatarUrl).
 * Nếu chuỗi đã bắt đầu bằng URL đầy đủ thì trả về nguyên gốc.
 */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith(MEDIA_BASE_URL) || path.startsWith("http")) return path;
  return `${MEDIA_BASE_URL}${path}`;
}

/**
 * Lấy 1-2 ký tự viết tắt từ tên đầy đủ để làm avatar tạm.
 * VD: "Nguyễn Văn Trà" → "NT", "Trà" → "T"
 */
export function getNameInitials(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return "?";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Hàm xử lý lỗi tập trung, hiển thị thông báo qua sonner toast.
 * @param error - Đối tượng lỗi (từ axios hoặc Error) hoặc chuỗi thông báo.
 * @param defaultMessage - Thông báo mặc định nếu không tìm thấy nội dung lỗi cụ thể.
 */
export function handleError(
  error: unknown,
  defaultMessage: string = "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
) {
  let message = defaultMessage;

  if (typeof error === "string" && error.trim().length > 0) {
    message = error;
  } else if (error && typeof error === "object") {
    // Thử trích xuất message từ cấu trúc AxiosError
    const errorObj = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    if (errorObj.response?.data?.message) {
      message = errorObj.response.data.message;
    } else if (
      errorObj.message &&
      errorObj.message !== "An unknown error occurred"
    ) {
      message = errorObj.message;
    }
  }

  toast.error(message);
}
