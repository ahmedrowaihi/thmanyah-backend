import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProgramModule } from './program/program.module';
import { HealthModule } from './health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '~/common';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    TypeOrmModule.forRoot(typeOrmConfig),
    ProgramModule,
    HealthModule,
  ],
})
export class AppModule {}
