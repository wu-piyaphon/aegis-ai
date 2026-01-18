import { compare, hash } from "bcryptjs";

/**
 * Hash a password using bcrypt with 12 rounds
 * This is a secure hashing function that is intentionally slow to resist brute-force attacks
 *
 * @param password - Plain text password to hash
 * @returns Promise with hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Verify a password against a hashed password
 *
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise with boolean indicating if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
