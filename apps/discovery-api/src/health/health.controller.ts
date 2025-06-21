import { Controller, Get, Version } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @Version('1')
  @HealthCheck()
  check() {
    return this.health.check([
      // Basic health check
      () => Promise.resolve({ app: { status: 'up' } }),
    ]);
  }

  @Get('ready')
  @Version('1')
  @HealthCheck()
  readiness() {
    return this.health.check([
      // Readiness check
      () => Promise.resolve({ app: { status: 'up' } }),
    ]);
  }

  @Get('live')
  @Version('1')
  @HealthCheck()
  liveness() {
    return this.health.check([
      // Basic liveness check - just return success
      () => Promise.resolve({ liveness: { status: 'up' } }),
    ]);
  }

  @Get('detailed')
  @Version('1')
  @HealthCheck()
  detailed() {
    return this.health.check([
      () => Promise.resolve({ app: { status: 'up' } }),
    ]);
  }
}
