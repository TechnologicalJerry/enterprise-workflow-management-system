// ============================================
// Health Check DTOs
// ============================================

import { z } from 'zod';

export const HealthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy']);

export const HealthCheckSchema = z.object({
  name: z.string(),
  status: HealthStatusSchema,
  responseTime: z.number().optional(),
  message: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export const HealthCheckResponseSchema = z.object({
  status: HealthStatusSchema,
  version: z.string(),
  uptime: z.number(),
  timestamp: z.string(),
  checks: z.array(HealthCheckSchema),
});

export type HealthStatusDto = z.infer<typeof HealthStatusSchema>;
export type HealthCheckDto = z.infer<typeof HealthCheckSchema>;
export type HealthCheckResponseDto = z.infer<typeof HealthCheckResponseSchema>;

export class HealthCheckBuilder {
  private status: HealthStatusDto = 'healthy';
  private version: string;
  private uptime: number;
  private checks: HealthCheckDto[] = [];

  constructor(version: string, uptime: number) {
    this.version = version;
    this.uptime = uptime;
  }

  addCheck(check: HealthCheckDto): this {
    this.checks.push(check);
    if (check.status === 'unhealthy') {
      this.status = 'unhealthy';
    } else if (check.status === 'degraded' && this.status === 'healthy') {
      this.status = 'degraded';
    }
    return this;
  }

  build(): HealthCheckResponseDto {
    return {
      status: this.status,
      version: this.version,
      uptime: this.uptime,
      timestamp: new Date().toISOString(),
      checks: this.checks,
    };
  }
}
