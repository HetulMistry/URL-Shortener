import { resolveApiBaseUrl, resolveAppBaseUrl } from "./env";

export const API_BASE_URL = resolveApiBaseUrl();
export const APP_BASE_URL = resolveAppBaseUrl();

export function getBackendOrigin(): string {
  const apiUrl = import.meta.env.DEV
    ? undefined
    : import.meta.env.VITE_API_URL;

  if (apiUrl?.startsWith("http")) {
    return apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  }

  return APP_BASE_URL;
}

export function getShortUrl(shortCode: string): string {
  return `${APP_BASE_URL}/${shortCode}`;
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
