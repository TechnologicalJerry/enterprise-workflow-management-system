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
        const axiosError = error as AxiosError<{ error?: { message?: string } }>;
        logger.warn('Permission service unavailable or user has no roles', {
          userId,
          status: axiosError.response?.status,
          message: axiosError.response?.data?.error?.message,
        });
      }
      return { userId, roles: [], permissions: [] };
    }
  },

  async assignRolesToUser(
    userId: string,
    roleIds: string[],
    correlationId?: string
  ): Promise<{ roles: string[] }> {
    const { data } = await axios.put<{ success: boolean; data: { roles: string[] } }>(
      `${baseURL}/users/${userId}/roles`,
      { roleIds },
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

  async getRoleIdsByNames(roleNames: string[], correlationId?: string): Promise<string[]> {
    try {
      const { data } = await axios.post<{ success: boolean; roleIds: string[] }>(
        `${baseURL}/roles/by-names`,
        { names: roleNames },
        {
          timeout,
          headers: {
            'Content-Type': 'application/json',
            ...(correlationId && { 'X-Correlation-ID': correlationId }),
          },
        }
      );
      return data.roleIds ?? [];
    } catch (error) {
      logger.warn('Failed to resolve role names to IDs', { roleNames, error });
      return [];
    }
  },
};
