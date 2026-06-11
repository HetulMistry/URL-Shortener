const ALIAS_PATTERN = /^[a-zA-Z0-9_-]+$/;
const RESERVED_ALIASES = new Set(["api", "login", "register", "logout", "me"]);
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function hasAllowedProtocol(protocol: string): boolean {
  return ALLOWED_PROTOCOLS.has(protocol);
}

export function normalizeOriginalUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!hasAllowedProtocol(parsed.protocol)) {
      throw new Error("Unsupported protocol");
    }
    return parsed.toString();
  } catch {
    return withProtocol;
  }
}

export function validateOriginalUrl(input: string): string | null {
  const normalized = normalizeOriginalUrl(input);
  if (!normalized) return "URL is required";

  try {
    const parsed = new URL(normalized);
    if (!hasAllowedProtocol(parsed.protocol)) {
      return "Only HTTP and HTTPS URLs are allowed";
    }
    if (!parsed.hostname) {
      return "Please enter a valid URL";
    }
  } catch {
    return "Please enter a valid URL";
  }

  return null;
}

export function validateCustomAlias(alias: string): string | null {
  const trimmed = alias.trim();
  if (!trimmed) return null;

  if (trimmed.length < 3 || trimmed.length > 50) {
    return "Alias must be between 3 and 50 characters";
  }

  if (!ALIAS_PATTERN.test(trimmed)) {
    return "Only letters, numbers, dashes, and underscores are allowed";
  }

  if (RESERVED_ALIASES.has(trimmed.toLowerCase())) {
    return "This alias is reserved";
  }

  return null;
}

export function formatExpirationDate(dateValue: string): string {
  const endOfDay = new Date(`${dateValue}T23:59:59`);
  return endOfDay.toISOString();
}
