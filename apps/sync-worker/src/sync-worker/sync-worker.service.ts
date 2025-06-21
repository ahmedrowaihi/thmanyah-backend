import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker, Job } from 'bullmq';
import {
  Program,
  QueueService,
  OutboxEventJob,
  IProgramIndexService,
  PROGRAM_INDEX_SERVICE,
  ProgramMapper,
} from '~/common';

interface JobPayload {
  programId: number;
}

interface ElasticsearchError {
  meta?: {
    statusCode?: number;
  };
}

@Injectable()
export class SyncWorkerService implements OnModuleInit {
  private readonly logger = new Logger(SyncWorkerService.name);
  private worker: Worker<OutboxEventJob>;

  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    private queueService: QueueService,
    @Inject(PROGRAM_INDEX_SERVICE)
    private programIndexService: IProgramIndexService,
    private programMapper: ProgramMapper,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Sync Worker Service...');

    // Start the worker
    this.startWorker();
  }

  private startWorker() {
    this.worker = new Worker(
      'outbox-events',
      async (job: Job<OutboxEventJob>) => {
        await this.processJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed:`, err);
    });

    this.logger.log('Sync Worker started');
  }

  private async processJob(job: Job<OutboxEventJob>) {
    const eventType = job.data.eventType;
    const payload = job.data.payload as unknown as JobPayload;

    this.logger.log(`Processing job ${job.id}: ${eventType}`);

    try {
      switch (eventType) {
        case 'PROGRAM_CREATED':
        case 'PROGRAM_UPDATED':
          await this.syncProgram(payload.programId);
          break;
        case 'PROGRAM_DELETED':
          await this.deleteProgram(payload.programId);
          break;
        default:
          this.logger.warn(`Unknown event type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }

  private async syncProgram(programId: number) {
    const program = await this.programRepository.findOne({
      where: { id: programId },
    });

    if (!program) {
      this.logger.warn(`Program ${programId} not found in database`);
      return;
    }

    // Convert Program to ProgramDocument for Elasticsearch
    const programDocument = this.programMapper.toDocument(program);
    await this.programIndexService.indexProgram(programDocument);
    this.logger.log(`Synced program ${programId} to Elasticsearch`);
  }

  private async deleteProgram(programId: number) {
    try {
      await this.programIndexService.deleteProgram(programId);
      this.logger.log(`Deleted program ${programId} from Elasticsearch`);
    } catch (error: unknown) {
      // Handle case where program doesn't exist in Elasticsearch
      const esError = error as ElasticsearchError;
      if (esError.meta?.statusCode === 404) {
        this.logger.debug(
          `Program ${programId} not found in Elasticsearch (already deleted or never indexed)`,
        );
        return;
      }
      // Re-throw other errors
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }
}
