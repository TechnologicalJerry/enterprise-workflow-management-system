// ============================================
// Common Types
// ============================================

export type UUID = string;

export type Timestamp = Date | string;

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

export interface BaseEntity {
  id: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt: Timestamp | null;
  isDeleted: boolean;
}

export interface AuditableEntity extends BaseEntity {
  createdBy: UUID;
  updatedBy: UUID | null;
}

export interface VersionedEntity extends BaseEntity {
  version: number;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export interface KeyValuePair<T = unknown> {
  key: string;
  value: T;
}

export interface DateRange {
  startDate: Timestamp;
  endDate: Timestamp;
}

export interface Metadata {
  [key: string]: JSONValue;
}

export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: string;
  order: SortOrder;
}

export type Environment = 'development' | 'staging' | 'production' | 'test';
