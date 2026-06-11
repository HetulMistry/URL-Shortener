const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export function getDevProxyTarget(): string {
  return import.meta.env.VITE_DEV_PROXY_TARGET || "http://localhost:3000";
}

export function resolveApiBaseUrl(): string {
  if (import.meta.env.DEV) return "/api/v1";
  return import.meta.env.VITE_API_URL || "/api/v1";
}

export function resolveAppBaseUrl(): string {
  if (import.meta.env.VITE_APP_URL) {
    return trimTrailingSlash(import.meta.env.VITE_APP_URL);
  }

  if (import.meta.env.DEV) {
    return trimTrailingSlash(
      import.meta.env.VITE_DEV_APP_URL || "http://localhost:3000",
    );
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function validateProductionEnv(): void {
  if (!import.meta.env.PROD) return;

  const warnings: string[] = [];

  if (!import.meta.env.VITE_APP_URL) {
    warnings.push(
      "VITE_APP_URL is not set — short links will use the current site origin.",
    );
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl?.startsWith("http") && !import.meta.env.VITE_APP_URL) {
    warnings.push(
      "VITE_APP_URL should be set when VITE_API_URL points to a different host.",
    );
  }

  if (warnings.length > 0) {
    console.warn("[config]", warnings.join(" "));
  }
}
