/**
 * Email validation regex
 * Validates basic email format: local@domain.tld
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates if a string is a valid email address
 * @param email - The email string to validate
 * @returns true if valid email format, false otherwise
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validates if a password meets minimum length requirement
 * @param password - The password string to validate
 * @param minLength - Minimum required length (default: 8)
 * @returns true if password meets length requirement, false otherwise
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}

/**
 * Phone number validation regex
 * Validates phone numbers in format: +1 (555) 000-0000 or similar
 */
export const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

/**
 * Validates if a string is a valid phone number
 * @param phone - The phone string to validate
 * @returns true if valid phone format, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

/**
 * Password strength levels
 */
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/**
 * Calculates password strength based on various criteria
 * @param password - The password to evaluate
 * @returns strength level from 0 (weak) to 4 (very strong)
 */
export function getPasswordStrength(password: string): PasswordStrength {
  let strength: PasswordStrength = 0;

  if (password.length === 0) return 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Contains lowercase and uppercase
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;

  // Contains numbers
  if (/[0-9]/.test(password)) strength++;

  // Contains special characters
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 4) as PasswordStrength;
}
