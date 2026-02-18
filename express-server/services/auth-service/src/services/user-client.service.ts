// ============================================
// User Service HTTP Client
// ============================================

import axios, { AxiosError } from 'axios';
import { appConfig } from '../config/app.config.js';
import { logger } from '../utils/logger.js';

const baseURL = appConfig.userServiceUrl;
const timeout = 5000;

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
}

export const userClient = {
  async createUser(
    payload: CreateUserPayload,
    correlationId?: string
  ): Promise<UserResponse> {
    const { data } = await axios.post<{ success: boolean; data: UserResponse }>(
      `${baseURL}/users`,
      payload,
      {
        timeout,
        headers: {
          'Content-Type': 'application/json',
          ...(correlationId && { 'X-Correlation-ID': correlationId }),
        },
      }
    );
    return data.data;
  },
};
