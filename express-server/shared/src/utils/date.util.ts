// ============================================
// Date Utility
// ============================================

/**
 * Returns the current timestamp as ISO string
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Returns the current timestamp as Date
 */
export function nowDate(): Date {
  return new Date();
}

/**
 * Adds seconds to a date
 */
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

/**
 * Adds minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Adds hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Adds days to a date
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Calculates the difference between two dates in milliseconds
 */
export function diffInMs(dateA: Date, dateB: Date): number {
  return Math.abs(dateA.getTime() - dateB.getTime());
}

/**
 * Calculates the difference between two dates in seconds
 */
export function diffInSeconds(dateA: Date, dateB: Date): number {
  return Math.floor(diffInMs(dateA, dateB) / 1000);
}

/**
 * Calculates the difference between two dates in minutes
 */
export function diffInMinutes(dateA: Date, dateB: Date): number {
  return Math.floor(diffInMs(dateA, dateB) / (1000 * 60));
}

/**
 * Checks if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Checks if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Checks if a date is expired based on TTL in seconds
 */
export function isExpired(createdAt: Date, ttlSeconds: number): boolean {
  const expiresAt = addSeconds(createdAt, ttlSeconds);
  return isPast(expiresAt);
}

/**
 * Formats a duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

/**
 * Parses a duration string (e.g., "1h", "30m", "15s") to milliseconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2];

  switch (unit) {
    case 'ms': return value;
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: throw new Error(`Unknown duration unit: ${unit}`);
  }
}

/**
 * Gets the start of the day for a given date
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the end of the day for a given date
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
