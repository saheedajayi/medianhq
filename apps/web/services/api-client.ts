import axios, { AxiosError, type AxiosInstance } from "axios";

const API_TIMEOUT = 15_000;
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
  .replace(/\/$/, "");
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";
const API_BASE_PATH = `/api/${API_VERSION}`;

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

const unwrapApiEnvelope = (payload: ApiEnvelope) => {
  if (
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
  ) {
    return {
      ...payload.data,
      ...(payload.message ? { message: payload.message } : {}),
    };
  }

  return payload.data;
};

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
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => {
    if (isApiEnvelope(response.data) && response.data.success) {
      response.data = unwrapApiEnvelope(response.data);
    }

    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message: getErrorMessage(error.response?.data, error.message),
      details: error.response?.data,
    };

    return Promise.reject(apiError);
  },
);
