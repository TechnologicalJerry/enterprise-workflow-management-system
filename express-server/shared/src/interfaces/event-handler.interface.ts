// ============================================
// Event Handler Interface
// ============================================

import type { DomainEvent, IntegrationEvent, Command } from '../types/kafka-message.types.js';
import type { KafkaTopic } from '../constants/kafka-topics.constants.js';

export interface IEventHandler<T = unknown> {
  handle(event: DomainEvent<T>): Promise<void>;
  canHandle(eventType: string): boolean;
}

export interface IIntegrationEventHandler<T = unknown> {
  handle(event: IntegrationEvent<T>): Promise<void>;
  canHandle(eventType: string): boolean;
}

export interface ICommandHandler<T = unknown, R = void> {
  execute(command: Command<T>): Promise<R>;
  canHandle(commandType: string): boolean;
}

export interface IEventPublisher {
  publish<T>(topic: KafkaTopic, event: DomainEvent<T>): Promise<void>;
  publishMany<T>(topic: KafkaTopic, events: DomainEvent<T>[]): Promise<void>;
}

export interface IEventSubscriber {
  subscribe(topic: KafkaTopic, handler: IEventHandler): void;
  unsubscribe(topic: KafkaTopic, handler: IEventHandler): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface IEventStore {
  append<T>(streamId: string, events: DomainEvent<T>[]): Promise<void>;
  getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getEventsByType(eventType: string, fromTimestamp?: Date): Promise<DomainEvent[]>;
}

export interface ISagaOrchestrator<TState = unknown> {
  start(correlationId: string, initialState: TState): Promise<void>;
  compensate(correlationId: string): Promise<void>;
  getState(correlationId: string): Promise<TState | null>;
}

export interface ISagaStep<TInput = unknown, TOutput = unknown> {
  name: string;
  execute(input: TInput): Promise<TOutput>;
  compensate(input: TInput): Promise<void>;
}

export interface IOutboxMessage {
  id: string;
  topic: KafkaTopic;
  payload: string;
  createdAt: Date;
  processedAt?: Date;
  retryCount: number;
}

export interface IOutboxRepository {
  save(message: IOutboxMessage): Promise<void>;
  getUnprocessed(limit: number): Promise<IOutboxMessage[]>;
  markAsProcessed(id: string): Promise<void>;
  incrementRetry(id: string): Promise<void>;
}
