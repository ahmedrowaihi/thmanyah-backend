import { Injectable, Logger } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Outbox, QueueService, OutboxEventJob } from '~/common';

@Injectable()
export class OutboxPublisherService implements OnModuleInit {
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor(
    @InjectRepository(Outbox)
    private outboxRepository: Repository<Outbox>,
    private queueService: QueueService,
  ) {}

  onModuleInit() {
    this.logger.log('Outbox Publisher Service initialized');
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async publishOutboxEvents() {
    this.logger.debug('Checking for unprocessed outbox events...');

    // Use repository manager to create query runner
    const queryRunner =
      this.outboxRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Use SELECT FOR UPDATE SKIP LOCKED to prevent race conditions
      const unprocessedEvents = await queryRunner.manager
        .createQueryBuilder(Outbox, 'outbox')
        .where('outbox.processed = :processed', { processed: false })
        .orderBy('outbox.createdAt', 'ASC')
        .limit(100)
        .setLock('pessimistic_write')
        .getMany();

      if (unprocessedEvents.length === 0) {
        // this.logger.debug('No unprocessed events found');
        await queryRunner.rollbackTransaction();
        return;
      }

      this.logger.log(`Found ${unprocessedEvents.length} unprocessed events`);

      // Publish each event to the queue
      for (const event of unprocessedEvents) {
        try {
          const job: OutboxEventJob = {
            outboxId: event.id,
            eventType: event.eventType,
            payload: event.payload as Record<string, unknown>,
          };

          await this.queueService.addOutboxEventJob(job);

          // Mark as processed within the same transaction
          event.processed = true;
          await queryRunner.manager.save(Outbox, event);

          this.logger.debug(`Published event ${event.id} (${event.eventType})`);
        } catch (error) {
          this.logger.error(`Failed to publish event ${event.id}:`, error);
          // Continue with other events even if one fails
        }
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      this.logger.debug('Successfully processed outbox events');
    } catch (error) {
      this.logger.error('Error in publishOutboxEvents:', error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
