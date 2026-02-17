// ============================================
// Security Configuration
// ============================================

import { z } from 'zod';

const envSchema = z.object({
  // Password policy
  PASSWORD_MIN_LENGTH: z.string().transform(Number).default('8'),
  PASSWORD_MAX_LENGTH: z.string().transform(Number).default('128'),
  PASSWORD_REQUIRE_UPPERCASE: z.string().transform((v) => v === 'true').default('true'),
  PASSWORD_REQUIRE_LOWERCASE: z.string().transform((v) => v === 'true').default('true'),
  PASSWORD_REQUIRE_NUMBER: z.string().transform((v) => v === 'true').default('true'),
  PASSWORD_REQUIRE_SPECIAL: z.string().transform((v) => v === 'true').default('true'),
  
  // Account lockout
  MAX_FAILED_ATTEMPTS: z.string().transform(Number).default('5'),
  LOCKOUT_DURATION_MINUTES: z.string().transform(Number).default('30'),
  
  // Token expiry
  PASSWORD_RESET_TOKEN_EXPIRES_HOURS: z.string().transform(Number).default('1'),
  EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS: z.string().transform(Number).default('24'),
  
  // Session
  SESSION_EXPIRES_HOURS: z.string().transform(Number).default('24'),
  MAX_SESSIONS_PER_USER: z.string().transform(Number).default('5'),
  
  // Bcrypt
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
});

const parseEnv = (): z.infer<typeof envSchema> => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    return envSchema.parse({});
  }
  return parsed.data;
};

const env = parseEnv();

export const securityConfig = {
  password: {
    minLength: env.PASSWORD_MIN_LENGTH,
    maxLength: env.PASSWORD_MAX_LENGTH,
    requireUppercase: env.PASSWORD_REQUIRE_UPPERCASE,
    requireLowercase: env.PASSWORD_REQUIRE_LOWERCASE,
    requireNumber: env.PASSWORD_REQUIRE_NUMBER,
    requireSpecial: env.PASSWORD_REQUIRE_SPECIAL,
  },
  
  lockout: {
    maxFailedAttempts: env.MAX_FAILED_ATTEMPTS,
    durationMinutes: env.LOCKOUT_DURATION_MINUTES,
  },
  
  tokens: {
    passwordResetExpiresHours: env.PASSWORD_RESET_TOKEN_EXPIRES_HOURS,
    emailVerificationExpiresHours: env.EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS,
  },
  
  session: {
    expiresHours: env.SESSION_EXPIRES_HOURS,
    maxPerUser: env.MAX_SESSIONS_PER_USER,
  },
  
  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },
} as const;

export type SecurityConfig = typeof securityConfig;
