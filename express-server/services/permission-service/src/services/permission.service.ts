// ============================================
// Permission Service (resource permissions CRUD)
// ============================================

import { permissionRepository } from '../repositories/permission.repository.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

export const permissionService = {
  async list(resource?: string) {
    return permissionRepository.list({ resource });
  },

  async getById(id: string) {
    const perm = await permissionRepository.findById(id);
    if (!perm) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Permission not found', ERROR_CODES.GENERAL.NOT_FOUND);
    }
    return perm;
  },

  async create(data: { name: string; description?: string; resource: string; action: string }) {
    const existing = await permissionRepository.findByName(data.name);
    if (existing) {
      throw new HttpError(HTTP_STATUS.CONFLICT, 'Permission name already exists', ERROR_CODES.GENERAL.CONFLICT);
    }
    return permissionRepository.create(data);
  },

  async update(id: string, data: { description?: string }) {
    await this.getById(id);
    return permissionRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    await permissionRepository.delete(id);
  },
};
