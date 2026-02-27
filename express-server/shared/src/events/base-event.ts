// ============================================
// Base Event Classes
// ============================================

import type { UUID, Timestamp } from '../types/common.types.js';
import { generateUUID } from '../utils/crypto.util.js';

/**
 * Base class for domain events
 */
export abstract class BaseDomainEvent<TPayload = unknown> {
  public readonly eventId: UUID;
  public readonly eventType: string;
  public readonly aggregateId: UUID;
  public readonly aggregateType: string;
  public readonly version: number;
  public readonly timestamp: Timestamp;
  public readonly correlationId: string;
  public readonly causationId?: string;
  public readonly userId?: UUID;
  public readonly payload: TPayload;

  constructor(
    aggregateId: UUID,
    aggregateType: string,
    payload: TPayload,
    options: {
      correlationId: string;
      causationId?: string;
      userId?: UUID;
      version?: number;
    }
  ) {
    this.eventId = generateUUID();
    this.eventType = this.constructor.name;
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.version = options.version ?? 1;
    this.timestamp = new Date().toISOString();
    this.correlationId = options.correlationId;
    this.causationId = options.causationId;
    this.userId = options.userId;
    this.payload = payload;
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      version: this.version,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      causationId: this.causationId,
      userId: this.userId,
      payload: this.payload,
    };
  }
}

/**
 * Base class for integration events
 */
export abstract class BaseIntegrationEvent<TPayload = unknown> {
  public readonly eventId: UUID;
  public readonly eventType: string;
  public readonly source: string;
  public readonly timestamp: Timestamp;
  public readonly correlationId: string;
  public readonly payload: TPayload;

  constructor(source: string, payload: TPayload, correlationId: string) {
    this.eventId = generateUUID();
    this.eventType = this.constructor.name;
    this.source = source;
    this.timestamp = new Date().toISOString();
    this.correlationId = correlationId;
    this.payload = payload;
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      source: this.source,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      payload: this.payload,
    };
  }
}

/**
 * Event envelope for Kafka messages
 */
export interface EventEnvelope<T = unknown> {
  eventId: string;
  eventType: string;
  timestamp: string;
  correlationId: string;
  source: string;
  version: string;
  data: T;
}

/**
 * Creates an event envelope
 */
export function createEventEnvelope<T>(
  eventType: string,
  data: T,
  correlationId: string,
  source: string
): EventEnvelope<T> {
  return {
    eventId: generateUUID(),
    eventType,
    timestamp: new Date().toISOString(),
    correlationId,
    source,
    version: '1.0',
    data,
  };
}
