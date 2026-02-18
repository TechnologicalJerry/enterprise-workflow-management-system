// ============================================
// Permission Service HTTP Client
// ============================================

import axios, { AxiosError } from 'axios';
import { appConfig } from '../config/app.config.js';
import { logger } from '../utils/logger.js';

const baseURL = appConfig.permissionServiceUrl;
const timeout = 5000;

export interface UserRolesResponse {
  userId: string;
  roles: string[];
  permissions: string[];
}

export const permissionClient = {
  async getUserRolesAndPermissions(
    userId: string,
    correlationId?: string
  ): Promise<UserRolesResponse> {
    try {
      const { data } = await axios.get<{ success: boolean; data: UserRolesResponse }>(
        `${baseURL}/users/${userId}/roles`,
        {
          timeout,
          headers: {
            'Content-Type': 'application/json',
            ...(correlationId && { 'X-Correlation-ID': correlationId }),
          },
        }
      );
      return data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.warn('Permission service unavailable or user has no roles', {
          userId,
          status: (error as AxiosError).response?.status,
        });
      }
      return { userId, roles: [], permissions: [] };
    }
  },
};
