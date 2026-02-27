// ============================================
// Conflict Errors
// ============================================

import { BaseError, type ErrorDetails } from './base.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';

export class ConflictError extends BaseError {
  constructor(message: string = 'Resource conflict', details?: ErrorDetails) {
    super(message, ERROR_CODES.CONFLICT, HTTP_STATUS.CONFLICT, true, details);
  }
}

export class UserAlreadyExistsError extends BaseError {
  public readonly email: string;

  constructor(email: string) {
    super(
      `User with email '${email}' already exists`,
      ERROR_CODES.USER_ALREADY_EXISTS,
      HTTP_STATUS.CONFLICT,
      true,
      { email }
    );
    this.email = email;
  }
}

export class WorkflowAlreadyExistsError extends BaseError {
  public readonly name: string;

  constructor(name: string) {
    super(
      `Workflow with name '${name}' already exists`,
      ERROR_CODES.WORKFLOW_ALREADY_EXISTS,
      HTTP_STATUS.CONFLICT,
      true,
      { name }
    );
    this.name = name;
  }
}

export class OptimisticLockError extends ConflictError {
  public readonly expectedVersion: number;
  public readonly actualVersion: number;

  constructor(expectedVersion: number, actualVersion: number) {
    super(
      `Optimistic lock failed: expected version ${expectedVersion}, but found ${actualVersion}`
    );
    this.expectedVersion = expectedVersion;
    this.actualVersion = actualVersion;
  }
}

export class DuplicateResourceError extends ConflictError {
  public readonly resourceType: string;
  public readonly field: string;
  public readonly value: string;

  constructor(resourceType: string, field: string, value: string) {
    super(`${resourceType} with ${field} '${value}' already exists`);
    this.resourceType = resourceType;
    this.field = field;
    this.value = value;
  }
}
