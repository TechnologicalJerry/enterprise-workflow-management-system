// ============================================
// Crypto Utility
// ============================================

import { randomBytes, createHash, createHmac, timingSafeEqual } from 'crypto';

/**
 * Generates a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generates a UUID v4
 */
export function generateUUID(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Creates a SHA-256 hash of the input
 */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Creates a SHA-512 hash of the input
 */
export function sha512(input: string): string {
  return createHash('sha512').update(input).digest('hex');
}

/**
 * Creates an HMAC signature
 */
export function createHmacSignature(data: string, secret: string, algorithm: string = 'sha256'): string {
  return createHmac(algorithm, secret).update(data).digest('hex');
}

/**
 * Verifies an HMAC signature using timing-safe comparison
 */
export function verifyHmacSignature(
  data: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  const expectedSignature = createHmacSignature(data, secret, algorithm);
  
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Generates a secure OTP code
 */
export function generateOTP(length: number = 6): string {
  const max = Math.pow(10, length);
  const randomValue = randomBytes(4).readUInt32BE(0);
  const otp = randomValue % max;
  return otp.toString().padStart(length, '0');
}

/**
 * Creates a hash for idempotency key
 */
export function createIdempotencyHash(data: Record<string, unknown>): string {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return sha256(sortedData);
}

/**
 * Generates a secure file checksum
 */
export function generateChecksum(content: Buffer | string): string {
  return createHash('md5').update(content).digest('hex');
}
