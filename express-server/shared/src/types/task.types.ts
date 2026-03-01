// ============================================
// Task Types
// ============================================

import type { AuditableEntity, UUID, Metadata, JSONObject } from './common.types.js';
import type { TaskStatus, TaskPriority } from '../constants/workflow-states.constants.js';

export interface Task extends AuditableEntity {
  workflowInstanceId: UUID;
  nodeId: string;
  name: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: UUID;
  assigneeGroupId?: UUID;
  delegatedFrom?: UUID;
  formSchema?: TaskFormSchema;
  formData?: JSONObject;
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  escalatedAt?: Date;
  metadata: Metadata;
}

export type TaskType = 
  | 'user_task'
  | 'approval_task'
  | 'review_task'
  | 'form_task'
  | 'document_task'
  | 'notification_task';

export interface TaskFormSchema {
  fields: FormField[];
  validation?: JSONObject;
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  defaultValue?: unknown;
  options?: FormFieldOption[];
  validation?: FieldValidation;
  conditionalDisplay?: JSONObject;
}

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'user_picker'
  | 'rich_text';

export interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
}

export interface TaskAssignment {
  taskId: UUID;
  assigneeId: UUID;
  assignedBy: UUID;
  assignedAt: Date;
  reason?: string;
}

export interface TaskCompletion {
  taskId: UUID;
  completedBy: UUID;
  completedAt: Date;
  formData?: JSONObject;
  outcome: string;
  comments?: string;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: UUID;
  workflowInstanceId?: UUID;
  type?: TaskType[];
  dueBefore?: Date;
  dueAfter?: Date;
  overdue?: boolean;
  search?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  averageCompletionTime: number;
}
