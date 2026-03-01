// ============================================
// Document Types
// ============================================

import type { AuditableEntity, SoftDeleteEntity, UUID, Metadata } from './common.types.js';

export interface Document extends AuditableEntity, SoftDeleteEntity {
  name: string;
  originalName: string;
  description?: string;
  mimeType: string;
  size: number;
  extension: string;
  storageKey: string;
  storageBucket: string;
  checksum: string;
  version: number;
  status: DocumentStatus;
  accessLevel: DocumentAccessLevel;
  ownerId: UUID;
  folderId?: UUID;
  workflowInstanceId?: UUID;
  taskId?: UUID;
  tags: string[];
  metadata: Metadata;
  versions: DocumentVersion[];
}

export type DocumentStatus = 'active' | 'archived' | 'pending_review' | 'quarantined';

export type DocumentAccessLevel = 'private' | 'restricted' | 'internal' | 'public';

export interface DocumentVersion {
  version: number;
  storageKey: string;
  size: number;
  checksum: string;
  createdBy: UUID;
  createdAt: Date;
  comments?: string;
}

export interface DocumentFolder extends AuditableEntity {
  name: string;
  description?: string;
  parentId?: UUID;
  path: string;
  ownerId: UUID;
  accessLevel: DocumentAccessLevel;
  metadata: Metadata;
}

export interface DocumentUploadRequest {
  name?: string;
  description?: string;
  folderId?: UUID;
  workflowInstanceId?: UUID;
  taskId?: UUID;
  accessLevel?: DocumentAccessLevel;
  tags?: string[];
  metadata?: Metadata;
}

export interface DocumentUploadResult {
  document: Document;
  uploadUrl?: string; // For direct upload to storage
}

export interface DocumentDownloadRequest {
  documentId: UUID;
  version?: number;
  inline?: boolean; // For browser viewing vs download
}

export interface DocumentDownloadResult {
  downloadUrl: string;
  expiresAt: Date;
  document: Document;
}

export interface DocumentFilter {
  status?: DocumentStatus[];
  accessLevel?: DocumentAccessLevel[];
  ownerId?: UUID;
  folderId?: UUID;
  workflowInstanceId?: UUID;
  taskId?: UUID;
  mimeType?: string[];
  tags?: string[];
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface DocumentPermission {
  documentId: UUID;
  userId?: UUID;
  groupId?: UUID;
  role?: string;
  permissions: DocumentPermissionType[];
  grantedBy: UUID;
  grantedAt: Date;
  expiresAt?: Date;
}

export type DocumentPermissionType = 'view' | 'download' | 'edit' | 'delete' | 'share' | 'manage';

export interface DocumentScanResult {
  documentId: UUID;
  scannedAt: Date;
  isClean: boolean;
  threats?: string[];
  scanEngine: string;
}
