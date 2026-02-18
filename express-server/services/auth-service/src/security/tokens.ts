// ============================================
// Token Generation Utilities
// ============================================

import crypto from 'crypto';

// Generate secure random token (URL-safe)
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('base64url');
};

// Generate UUID v4
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

// Hash token for storage (SHA-256)
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Verify token against hash
export const verifyTokenHash = (token: string, hash: string): boolean => {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
};

// Generate MFA secret
export const generateMfaSecret = (): string => {
  return crypto.randomBytes(20).toString('base32');
};

// Generate backup codes
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  
  return codes;
};

// Generate session ID
export const generateSessionId = (): string => {
  return `sess_${crypto.randomBytes(24).toString('base64url')}`;
};

// Generate token family ID (for refresh token rotation)
export const generateFamilyId = (): string => {
  return `fam_${crypto.randomBytes(16).toString('base64url')}`;
};
