import { createId, isCuid } from '@paralleldrive/cuid2';

/**
 * Generate a new CUID2 for database records
 * CUID2s are secure, collision-resistant IDs optimized for horizontal scaling
 * Default length is 24 characters
 */
export function generateId(): string {
  return createId();
}

/**
 * Validate if a string is a valid CUID2 format
 */
export function isValidCuid(id: string): boolean {
  return isCuid(id);
}
