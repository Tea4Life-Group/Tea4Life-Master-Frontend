import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import keycloak from "@/lib/keycloak";
import { store, clearAuth } from "@/features/store";

/*
===========================================================
  DEFINITIONS & TYPES
===========================================================
*/
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

interface FailedRequestQueue {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_BASE_URL;

const axiosClient: AxiosInstance = axios.create({
  baseURL: GATEWAY_BASE_URL,
});

let isRefreshing = false;
let failedQueue: FailedRequestQueue[] = [];

/*
===========================================================
   QUEUE HANDLER
===========================================================
*/
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/*
===========================================================
  REQUEST INTERCEPTOR
===========================================================
*/
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Chủ động cập nhật token 30s trước khi hết hạn
      await keycloak.updateToken(30);

      if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }
    } catch (err) {
      console.error("[Tea4Life] Request Interceptor Error:", err);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/*
===========================================================
 RESPONSE INTERCEPTOR (401 & SHARED PROMISE)
===========================================================
*/
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    // Đọc header WWW-Authenticate từ server trả về
    const authHeader = error.response.headers["www-authenticate"];
    const isExpired = authHeader && authHeader.includes("expired");

    /**
     * Chỉ thực hiện Retry nếu:
     * 1. Status là 401 Unauthorized
     * 2. Header xác nhận là do Expired (hoặc bạn có thể linh động cho phép retry mọi 401)
     * 3. Request này chưa từng được retry
     */
    if (error.response.status === 401 && isExpired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        keycloak
          .updateToken(70)
          .then(() => {
            const newToken = keycloak.token;
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosClient(originalRequest));
          })
          .catch((err: unknown) => {
            processQueue(err, null);
            store.dispatch(clearAuth());
            keycloak.logout();
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
