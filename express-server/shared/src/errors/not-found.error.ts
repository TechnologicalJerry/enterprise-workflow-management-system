// ============================================
// Not Found Errors
// ============================================

import { BaseError, type ErrorDetails } from './base.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';
import type { UUID } from '../types/common.types.js';

export class NotFoundError extends BaseError {
  public readonly resourceType: string;
  public readonly resourceId?: UUID | string;

  constructor(resourceType: string, resourceId?: UUID | string, message?: string) {
    const defaultMessage = resourceId
      ? `${resourceType} with ID '${resourceId}' not found`
      : `${resourceType} not found`;
    super(message ?? defaultMessage, ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, true, {
      resourceType,
      resourceId,
    });
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(userId?: UUID) {
    super('User', userId, userId ? `User with ID '${userId}' not found` : 'User not found');
  }
}

export class WorkflowNotFoundError extends NotFoundError {
  constructor(workflowId?: UUID) {
    super(
      'Workflow',
      workflowId,
      workflowId ? `Workflow with ID '${workflowId}' not found` : 'Workflow not found'
    );
  }
}

export class TaskNotFoundError extends NotFoundError {
  constructor(taskId?: UUID) {
    super('Task', taskId, taskId ? `Task with ID '${taskId}' not found` : 'Task not found');
  }
}

export class ApprovalNotFoundError extends NotFoundError {
  constructor(approvalId?: UUID) {
    super(
      'Approval',
      approvalId,
      approvalId ? `Approval with ID '${approvalId}' not found` : 'Approval not found'
    );
  }
}

export class DocumentNotFoundError extends NotFoundError {
  constructor(documentId?: UUID) {
    super(
      'Document',
      documentId,
      documentId ? `Document with ID '${documentId}' not found` : 'Document not found'
    );
  }
}

export class RouteNotFoundError extends BaseError {
  public readonly method: string;
  public readonly path: string;

  constructor(method: string, path: string) {
    super(`Route ${method} ${path} not found`, ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, true, {
      method,
      path,
    });
    this.method = method;
    this.path = path;
  }
}
