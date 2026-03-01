// ============================================
// Request Test Helpers
// ============================================

import type { Request, Response } from 'express';
import { generateUUID } from '../../utils/crypto.util.js';
import type { AuthenticatedUser } from '../../types/auth.types.js';

/**
 * Creates a mock Express request
 */
export function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    method: 'GET',
    path: '/test',
    query: {},
    params: {},
    body: {},
    headers: {},
    correlationId: generateUUID(),
    requestId: generateUUID(),
    ip: '127.0.0.1',
    get: ((name: string) => {
      const headers = (overrides.headers ?? {}) as Record<string, string>;
      return headers[name.toLowerCase()];
    }) as Request['get'],
    ...overrides,
  };
}

/**
 * Creates a mock Express response
 */
export function createMockResponse(): {
  res: Partial<Response>;
  statusCode: number;
  jsonData: unknown;
  headers: Map<string, string>;
} {
  let statusCode = 200;
  let jsonData: unknown = null;
  const headers = new Map<string, string>();

  const res: Partial<Response> = {
    status: function(code: number) {
      statusCode = code;
      return this as Response;
    },
    json: function(data: unknown) {
      jsonData = data;
      return this as Response;
    },
    send: function(data: unknown) {
      jsonData = data;
      return this as Response;
    },
    setHeader: function(name: string, value: string) {
      headers.set(name, value);
      return this as Response;
    },
    getHeader: function(name: string) {
      return headers.get(name);
    },
    end: function() {
      return this as Response;
    },
    headersSent: false,
  };

  return { res, statusCode, jsonData, headers };
}

/**
 * Creates an authenticated mock request
 */
export function createAuthenticatedRequest(
  user: AuthenticatedUser,
  overrides: Partial<Request> = {}
): Partial<Request> & { user: AuthenticatedUser } {
  const req = createMockRequest({
    headers: {
      authorization: 'Bearer mock-token',
    },
    ...overrides,
  });

  return {
    ...req,
    user,
  } as Partial<Request> & { user: AuthenticatedUser };
}

/**
 * Creates mock request with body
 */
export function createRequestWithBody<T>(body: T, overrides: Partial<Request> = {}): Partial<Request> {
  return createMockRequest({
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
    },
    ...overrides,
  });
}

/**
 * Creates mock request with query params
 */
export function createRequestWithQuery(
  query: Record<string, string>,
  overrides: Partial<Request> = {}
): Partial<Request> {
  return createMockRequest({
    method: 'GET',
    query,
    ...overrides,
  });
}

/**
 * Creates mock request with URL params
 */
export function createRequestWithParams(
  params: Record<string, string>,
  overrides: Partial<Request> = {}
): Partial<Request> {
  return createMockRequest({
    params,
    ...overrides,
  });
}
