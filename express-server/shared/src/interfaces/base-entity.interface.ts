// ============================================
// Base Entity Interface
// ============================================

import type { UUID, Timestamp } from '../types/common.types.js';

export interface IBaseEntity {
  readonly id: UUID;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

export interface ISoftDeletable {
  readonly deletedAt: Timestamp | null;
  readonly isDeleted: boolean;
}

export interface IAuditable {
  readonly createdBy: UUID;
  readonly updatedBy: UUID | null;
}

export interface IVersioned {
  readonly version: number;
}
