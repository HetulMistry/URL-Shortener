import axios, { type AxiosInstance, type AxiosError } from "axios";
import type {
  ApiResponse,
  AuthPayload,
  ShortUrl,
  PaginatedResponse,
  Analytics,
  User,
} from "@/types";
import { API_BASE_URL } from "@/lib/config";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && token !== "undefined")
    config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const isAuthPage =
        path.startsWith("/auth/login") || path.startsWith("/auth/register");

      if (!isAuthPage) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authService = {
  register: (name: string, email: string, password: string) =>
    api.post<ApiResponse<AuthPayload>>("/auth/register", {
      name,
      email,
      password,
    }),

  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthPayload>>("/auth/login", { email, password }),

  logout: () => api.post<ApiResponse<{ message: string }>>("/auth/logout"),

  getMe: () => api.get<ApiResponse<{ user: User }>>("/auth/me"),
};

export const urlService = {
  createUrl: (
    originalUrl: string,
    customAlias?: string,
    expiresAt?: string,
  ) => {
    const body: {
      originalUrl: string;
      customAlias?: string;
      expiresAt?: string;
    } = { originalUrl };

    if (customAlias) body.customAlias = customAlias;
    if (expiresAt) body.expiresAt = expiresAt;

    return api.post<ApiResponse<{ url: ShortUrl }>>("/urls", body);
  },

  getUserUrls: (page: number = 1, limit: number = 10, search?: string) =>
    api.get<ApiResponse<PaginatedResponse<ShortUrl>>>("/urls", {
      params: { page, limit, search: search || undefined },
    }),

  getUrlDetails: (id: string) =>
    api.get<ApiResponse<{ url: ShortUrl }>>(`/urls/${id}`),

  updateUrl: (id: string, customAlias?: string, expiresAt?: string | null) => {
    const body: { customAlias?: string; expiresAt?: string | null } = {};

    if (customAlias !== undefined) body.customAlias = customAlias;
    if (expiresAt !== undefined) body.expiresAt = expiresAt;

    return api.patch<ApiResponse<{ url: ShortUrl }>>(`/urls/${id}`, body);
  },

  deleteUrl: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/urls/${id}`),

  getAnalytics: (id: string, startDate?: string, endDate?: string) =>
    api.get<ApiResponse<Analytics>>(`/urls/${id}/analytics`, {
      params: {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
    }),

  exportCsv: (id: string) =>
    api.get(`/urls/${id}/export`, { responseType: "blob" }),

  getQrCode: (id: string, format: "base64" | "png" = "base64") =>
    api.get<ApiResponse<{ qrCode: string; shortUrl: string }>>(
      `/urls/${id}/qr`,
      { params: { format } },
    ),
};

export default api;
