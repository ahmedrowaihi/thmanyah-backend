import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';
import { ElasticsearchModule } from '~/common';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 200, // 200 requests per minute (higher for public API)
      },
    ]),
    SearchModule,
    ElasticsearchModule,
    HealthModule,
  ],
})
export class AppModule {}
