export const API_BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : import.meta.env.VITE_API_URL || "/api/v1";

export const APP_BASE_URL =
  import.meta.env.VITE_APP_URL || "http://localhost:3000";

export function getBackendOrigin(): string {
  if (import.meta.env.DEV) return APP_BASE_URL.replace(/\/$/, "");

  const apiUrl = import.meta.env.VITE_API_URL || "/api/v1";
  if (apiUrl.startsWith("http")) return apiUrl.replace(/\/api\/v1\/?$/, "");

  return APP_BASE_URL.replace(/\/$/, "");
}

export function getShortUrl(shortCode: string): string {
  return `${APP_BASE_URL.replace(/\/$/, "")}/${shortCode}`;
}

export const SHORT_CODE_PATTERN = /^[a-zA-Z0-9_-]{3,50}$/;

export const RESERVED_SHORT_CODES = new Set([
  "api",
  "login",
  "register",
  "logout",
  "me",
  "auth",
  "dashboard",
  "health",
]);
