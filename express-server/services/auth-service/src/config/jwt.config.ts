// ============================================
// JWT Configuration
// ============================================

import { z } from 'zod';

const envSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().default('workflow-system'),
  JWT_AUDIENCE: z.string().default('workflow-api'),
});

const parseEnv = (): z.infer<typeof envSchema> => {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid JWT configuration:');
    console.error(parsed.error.format());
    process.exit(1);
  }
  
  return parsed.data;
};

const env = parseEnv();

// Parse duration string to milliseconds
const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: throw new Error(`Unknown duration unit: ${unit}`);
  }
};

export const jwtConfig = {
  access: {
    secret: env.JWT_ACCESS_SECRET,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    expiresInMs: parseDuration(env.JWT_ACCESS_EXPIRES_IN),
  },
  refresh: {
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    expiresInMs: parseDuration(env.JWT_REFRESH_EXPIRES_IN),
  },
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
} as const;

export type JwtConfig = typeof jwtConfig;
