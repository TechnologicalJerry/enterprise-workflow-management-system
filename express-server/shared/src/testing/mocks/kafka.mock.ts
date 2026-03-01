// ============================================
// Kafka Mock
// ============================================

import type { IEventPublisher, IEventSubscriber, IEventHandler } from '../../interfaces/event-handler.interface.js';
import type { DomainEvent } from '../../types/kafka-message.types.js';
import type { KafkaTopic } from '../../constants/kafka-topics.constants.js';

export interface MockKafkaProducer {
  messages: Array<{ topic: KafkaTopic; event: DomainEvent }>;
  publish<T>(topic: KafkaTopic, event: DomainEvent<T>): Promise<void>;
  publishMany<T>(topic: KafkaTopic, events: DomainEvent<T>[]): Promise<void>;
  clear(): void;
}

export function createMockKafkaProducer(): MockKafkaProducer & IEventPublisher {
  const messages: Array<{ topic: KafkaTopic; event: DomainEvent }> = [];

  return {
    messages,

    async publish<T>(topic: KafkaTopic, event: DomainEvent<T>): Promise<void> {
      messages.push({ topic, event: event as DomainEvent });
    },

    async publishMany<T>(topic: KafkaTopic, events: DomainEvent<T>[]): Promise<void> {
      for (const event of events) {
        messages.push({ topic, event: event as DomainEvent });
      }
    },

    clear(): void {
      messages.length = 0;
    },
  };
}

export interface MockKafkaConsumer {
  handlers: Map<KafkaTopic, IEventHandler[]>;
  subscribe(topic: KafkaTopic, handler: IEventHandler): void;
  unsubscribe(topic: KafkaTopic, handler: IEventHandler): void;
  simulateMessage<T>(topic: KafkaTopic, event: DomainEvent<T>): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createMockKafkaConsumer(): MockKafkaConsumer & IEventSubscriber {
  const handlers = new Map<KafkaTopic, IEventHandler[]>();
  let isRunning = false;

  return {
    handlers,

    subscribe(topic: KafkaTopic, handler: IEventHandler): void {
      const topicHandlers = handlers.get(topic) ?? [];
      topicHandlers.push(handler);
      handlers.set(topic, topicHandlers);
    },

    unsubscribe(topic: KafkaTopic, handler: IEventHandler): void {
      const topicHandlers = handlers.get(topic) ?? [];
      const index = topicHandlers.indexOf(handler);
      if (index > -1) {
        topicHandlers.splice(index, 1);
      }
    },

    async simulateMessage<T>(topic: KafkaTopic, event: DomainEvent<T>): Promise<void> {
      if (!isRunning) {
        throw new Error('Consumer is not running');
      }

      const topicHandlers = handlers.get(topic) ?? [];
      for (const handler of topicHandlers) {
        if (handler.canHandle(event.eventType)) {
          await handler.handle(event as DomainEvent);
        }
      }
    },

    async start(): Promise<void> {
      isRunning = true;
    },

    async stop(): Promise<void> {
      isRunning = false;
    },
  };
}
