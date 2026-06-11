const ALIAS_PATTERN = /^[a-zA-Z0-9_-]+$/;
const RESERVED_ALIASES = new Set(["api", "login", "register", "logout", "me"]);

export function normalizeOriginalUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:")
      return parsed.toString();
  } catch {
    // fall through
  }

  return `https://${trimmed}`;
}

export function validateOriginalUrl(input: string): string | null {
  const normalized = normalizeOriginalUrl(input);
  if (!normalized) return "URL is required";

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return "Only HTTP and HTTPS URLs are allowed";
  } catch {
    return "Please enter a valid URL";
  }

  return null;
}

export function validateCustomAlias(alias: string): string | null {
  const trimmed = alias.trim();
  if (!trimmed) return null;

  if (trimmed.length < 3 || trimmed.length > 50)
    return "Alias must be between 3 and 50 characters";

  if (!ALIAS_PATTERN.test(trimmed))
    return "Only letters, numbers, dashes, and underscores are allowed";

  if (RESERVED_ALIASES.has(trimmed.toLowerCase()))
    return "This alias is reserved";

  return null;
}

export function formatExpirationDate(dateValue: string): string {
  const endOfDay = new Date(`${dateValue}T23:59:59`);
  return endOfDay.toISOString();
}
