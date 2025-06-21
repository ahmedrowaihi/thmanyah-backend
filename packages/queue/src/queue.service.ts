import { Injectable, OnModuleInit } from "@nestjs/common";
import { Queue, Job, Worker } from "bullmq";
import Redis from "ioredis";
import { config } from "@thmanyah/config";
import { QUEUE_NAMES, SyncProgramJob, OutboxEventJob } from "./job-types";
import { IQueueService } from "@thmanyah/shared";

@Injectable()
export class QueueService implements IQueueService, OnModuleInit {
  private connection: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor() {
    this.connection = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
    });
  }

  async onModuleInit() {
    try {
      await this.connection.ping();
      console.log("✅ Redis connected successfully");
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error);
    }
  }

  async addJob<T = any>(
    jobType: string,
    data: T,
    options?: {
      delay?: number;
      priority?: number;
    }
  ): Promise<void> {
    const queue = this.getQueue(jobType);
    await queue.add(jobType, data, options);
  }

  processJob<T = any>(
    jobType: string,
    handler: (data: T) => Promise<void>
  ): void {
    if (this.workers.has(jobType)) {
      return; // Worker already exists
    }

    const worker = new Worker(
      jobType,
      async (job) => {
        await handler(job.data);
      },
      {
        connection: this.connection,
      }
    );

    this.workers.set(jobType, worker);
  }

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(
        name,
        new Queue(name, {
          connection: this.connection,
        })
      );
    }
    return this.queues.get(name)!;
  }

  async addSyncProgramJob(job: SyncProgramJob): Promise<Job<SyncProgramJob>> {
    return this.getQueue(QUEUE_NAMES.SYNC_PROGRAM).add("sync-program", job, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async addOutboxEventJob(job: OutboxEventJob): Promise<Job<OutboxEventJob>> {
    return this.getQueue(QUEUE_NAMES.OUTBOX_EVENTS).add("process-outbox", job, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }
}
