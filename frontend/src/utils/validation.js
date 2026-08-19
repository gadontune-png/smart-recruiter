export function validateRequired(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function validateEmail(email) {
  if (!validateRequired(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function validatePassword(password, minLength = 6) {
  if (!validateRequired(password)) return false;
  const value = String(password);
  if (value.length < minLength) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  if (!/\d/.test(value)) return false;
  return true;
}

export function validateMatch(value, match) {
  return value === match;
}

export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}