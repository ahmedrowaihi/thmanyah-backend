import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { Outbox } from "../entities/outbox.entity";
import { OutboxEvent, IOutboxService } from "@thmanyah/shared";

@Injectable()
export class OutboxService implements IOutboxService {
  constructor(
    @InjectRepository(Outbox)
    private readonly outboxRepo: Repository<Outbox>
  ) {}

  async createEvent(event: OutboxEvent): Promise<void> {
    const outboxEvent = this.outboxRepo.create({
      eventType: event.eventType,
      payload: event.payload,
      processed: false,
    });

    await this.outboxRepo.save(outboxEvent);
  }

  async createEventWithManager(
    manager: EntityManager,
    event: OutboxEvent
  ): Promise<void> {
    const outboxEvent = manager.create(Outbox, {
      eventType: event.eventType,
      payload: event.payload,
      processed: false,
    });

    await manager.save(Outbox, outboxEvent);
  }

  async getUnprocessedEvents(limit: number = 100): Promise<Outbox[]> {
    return this.outboxRepo.find({
      where: { processed: false },
      order: { createdAt: "ASC" },
      take: limit,
    });
  }

  async markAsProcessed(id: number): Promise<void> {
    await this.outboxRepo.update(id, { processed: true });
  }
}
