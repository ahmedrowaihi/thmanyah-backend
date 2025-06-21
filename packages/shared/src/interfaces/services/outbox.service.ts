import { OutboxEvent } from "../../models";

export interface IOutboxService {
  createEvent(event: OutboxEvent): Promise<void>;
  createEventWithManager(manager: any, event: OutboxEvent): Promise<void>;
  getUnprocessedEvents(limit?: number): Promise<any[]>;
  markAsProcessed(id: number): Promise<void>;
}
