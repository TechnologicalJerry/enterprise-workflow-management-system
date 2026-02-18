// ============================================
// JWT Security Utilities
// ============================================

import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config.js';

// Token payload interfaces
export interface AccessTokenPayload {
  sub: string; // User ID
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  familyId: string;
  generation: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

// Generate access token
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.access.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, jwtConfig.access.secret, options);
};

// Generate refresh token
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.refresh.expiresIn,
    issuer: jwtConfig.issuer,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, jwtConfig.refresh.secret, options);
};

// Verify access token
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const options: VerifyOptions = {
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithms: ['HS256'],
  };

  return jwt.verify(token, jwtConfig.access.secret, options) as AccessTokenPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const options: VerifyOptions = {
    issuer: jwtConfig.issuer,
    algorithms: ['HS256'],
  };

  return jwt.verify(token, jwtConfig.refresh.secret, options) as RefreshTokenPayload;
};

// Generate token pair
export const generateTokenPair = (
  accessPayload: AccessTokenPayload,
  refreshPayload: RefreshTokenPayload
): TokenPair => {
  return {
    accessToken: generateAccessToken(accessPayload),
    refreshToken: generateRefreshToken(refreshPayload),
    expiresIn: Math.floor(jwtConfig.access.expiresInMs / 1000),
    refreshExpiresIn: Math.floor(jwtConfig.refresh.expiresInMs / 1000),
  };
};

// Decode token without verification (for debugging)
export const decodeToken = (token: string): jwt.JwtPayload | null => {
  return jwt.decode(token) as jwt.JwtPayload | null;
};

// Get token expiration time
export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (decoded?.exp) {
    return new Date(decoded.exp * 1000);
  }
  return null;
};
