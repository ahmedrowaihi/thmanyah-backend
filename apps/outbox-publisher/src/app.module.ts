import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Outbox, OutboxService, typeOrmConfig, QueueModule } from '~/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxPublisherService } from './outbox-publisher/outbox-publisher.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Outbox]),
    QueueModule,
  ],
  providers: [OutboxPublisherService, OutboxService],
})
export class AppModule {}
