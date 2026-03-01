// ============================================
// Kafka Message Types
// ============================================

import type { UUID, Timestamp, JSONObject } from './common.types.js';
import type { KafkaTopic } from '../constants/kafka-topics.constants.js';

export interface KafkaMessage<T = JSONObject> {
  id: UUID;
  topic: KafkaTopic;
  key: string;
  value: T;
  headers: KafkaHeaders;
  timestamp: Timestamp;
  partition?: number;
  offset?: string;
}

export interface KafkaHeaders {
  correlationId: string;
  causationId?: string;
  messageType: string;
  source: string;
  version: string;
  contentType: 'application/json';
  timestamp: string;
  userId?: string;
  traceId?: string;
  spanId?: string;
}

export interface DomainEvent<T = JSONObject> {
  eventId: UUID;
  eventType: string;
  aggregateId: UUID;
  aggregateType: string;
  version: number;
  timestamp: Timestamp;
  correlationId: string;
  causationId?: string;
  userId?: UUID;
  payload: T;
  metadata: EventMetadata;
}

export interface EventMetadata {
  source: string;
  schemaVersion: string;
  environment: string;
  traceId?: string;
}

export interface IntegrationEvent<T = JSONObject> {
  eventId: UUID;
  eventType: string;
  source: string;
  timestamp: Timestamp;
  correlationId: string;
  payload: T;
}

export interface Command<T = JSONObject> {
  commandId: UUID;
  commandType: string;
  aggregateId?: UUID;
  timestamp: Timestamp;
  correlationId: string;
  userId?: UUID;
  payload: T;
  expectedVersion?: number;
}

export interface KafkaProducerConfig {
  clientId: string;
  brokers: string[];
  connectionTimeout?: number;
  requestTimeout?: number;
  retry?: {
    maxRetryTime?: number;
    initialRetryTime?: number;
    retries?: number;
  };
  ssl?: boolean;
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    password: string;
  };
}

export interface KafkaConsumerConfig extends KafkaProducerConfig {
  groupId: string;
  sessionTimeout?: number;
  heartbeatInterval?: number;
  maxBytesPerPartition?: number;
  minBytes?: number;
  maxBytes?: number;
  maxWaitTimeInMs?: number;
  fromBeginning?: boolean;
}

export interface ConsumerHandler<T = JSONObject> {
  topic: KafkaTopic;
  handler: (message: KafkaMessage<T>) => Promise<void>;
  options?: ConsumerHandlerOptions;
}

export interface ConsumerHandlerOptions {
  retries?: number;
  deadLetterTopic?: KafkaTopic;
  batchSize?: number;
  concurrency?: number;
}

export interface DeadLetterMessage<T = JSONObject> extends KafkaMessage<T> {
  originalTopic: KafkaTopic;
  errorMessage: string;
  errorStack?: string;
  retryCount: number;
  failedAt: Timestamp;
}
