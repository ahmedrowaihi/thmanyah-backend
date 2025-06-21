import { Controller, Get, Version } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @Version('1')
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.db.pingCheck('default'),
      () => Promise.resolve({ app: { status: 'up' } }),
    ]);
  }

  @Get('ready')
  @Version('1')
  @HealthCheck()
  async readiness() {
    return this.health.check([
      () => this.db.pingCheck('default'),
      () => Promise.resolve({ app: { status: 'up' } }),
    ]);
  }

  @Get('live')
  @Version('1')
  @HealthCheck()
  liveness() {
    return this.health.check([
      () => Promise.resolve({ liveness: { status: 'up' } }),
    ]);
  }

  @Get('detailed')
  @Version('1')
  @HealthCheck()
  async detailed() {
    return this.health.check([
      () => this.db.pingCheck('default', { timeout: 3000 }),
      () => Promise.resolve({ app: { status: 'up' } }),
    ]);
  }
}
