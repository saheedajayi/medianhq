import axios, { AxiosError, type AxiosInstance } from "axios";

const API_TIMEOUT = 15_000;
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";
export const API_BASE_PATH = `/api/${API_VERSION}`;
export const API_URL = `${API_BASE_URL}${API_BASE_PATH}`;

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

type ApiEnvelope<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
};

const isApiEnvelope = (payload: unknown): payload is ApiEnvelope => {
  return (
    !!payload &&
    typeof payload === "object" &&
    "success" in payload &&
    typeof (payload as { success?: unknown }).success === "boolean"
  );
};

const unwrapApiEnvelope = (payload: ApiEnvelope) => payload.data;

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const source = payload as {
    message?: unknown;
    error?: unknown;
  };

  if (typeof source.message === "string" && source.message.trim()) {
    return source.message;
  }

  if (typeof source.error === "string" && source.error.trim()) {
    return source.error;
  }

  return fallback;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_BASE_PATH}`,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    if (isApiEnvelope(response.data) && response.data.success) {
      response.data = unwrapApiEnvelope(response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean });
    const status = error.response?.status ?? 0;
    const url = originalRequest?.url ?? "";

    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password");

    if (status === 401 && !isAuthRoute && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${API_BASE_URL}${API_BASE_PATH}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);

        if (typeof window !== "undefined") {
          const pathname = window.location.pathname;
          const isDashboard =
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/mentor") ||
            pathname.startsWith("/mentee") ||
            pathname.startsWith("/bookings") ||
            pathname.startsWith("/settings");

          if (isDashboard) {
            window.location.href = `/signin?redirect=${encodeURIComponent(pathname)}`;
          }
        }

        const apiError: ApiError = {
          status: (refreshErr as AxiosError).response?.status ?? 401,
          message: getErrorMessage(
            (refreshErr as AxiosError).response?.data,
            "Session expired. Please sign in again.",
          ),
          details: (refreshErr as AxiosError).response?.data,
        };

        return Promise.reject(apiError);
      } finally {
        isRefreshing = false;
      }
    }

    const apiError: ApiError = {
      status,
      message: getErrorMessage(error.response?.data, error.message),
      details: error.response?.data,
    };

    return Promise.reject(apiError);
  },
);
