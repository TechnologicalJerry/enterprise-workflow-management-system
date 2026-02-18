// ============================================
// Password Security Utilities
// ============================================

import bcrypt from 'bcrypt';
import { securityConfig } from '../config/security.config.js';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, securityConfig.bcrypt.rounds);
};

// Verify password
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Validate password strength
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  const { password: config } = securityConfig;

  if (password.length < config.minLength) {
    errors.push(`Password must be at least ${config.minLength} characters`);
  }

  if (password.length > config.maxLength) {
    errors.push(`Password must be at most ${config.maxLength} characters`);
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (config.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (config.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common patterns
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password is too common');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generate random password
export const generateRandomPassword = (length: number = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};
