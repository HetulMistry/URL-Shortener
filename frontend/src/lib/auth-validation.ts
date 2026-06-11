const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  if (!EMAIL_PATTERN.test(trimmed)) return "Please enter a valid email address";
  return null;
}

export function validateLoginPassword(password: string): string | null {
  if (!password) return "Password is required";
  return null;
}

export function validateRegisterName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Name is required";
  return null;
}

export function validateRegisterPassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) return "Confirm password is required";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}
