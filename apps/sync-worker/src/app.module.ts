import { Module } from '@nestjs/common';
import {
  Program,
  Outbox,
  OutboxService,
  typeOrmConfig,
  QueueModule,
  ElasticsearchModule,
} from '~/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncWorkerService } from './sync-worker/sync-worker.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Program, Outbox]),
    QueueModule,
    ElasticsearchModule,
  ],
  providers: [SyncWorkerService, OutboxService],
})
export class AppModule {}
