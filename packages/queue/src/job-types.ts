import { OutboxEventPayload } from "@thmanyah/shared";

export interface SyncProgramJob {
  programId: number;
  eventType: "PROGRAM_CREATED" | "PROGRAM_UPDATED" | "PROGRAM_DELETED";
}

export interface OutboxEventJob {
  outboxId: string;
  eventType: string;
  payload: OutboxEventPayload;
}

export const QUEUE_NAMES = {
  SYNC_PROGRAM: "sync-program",
  OUTBOX_EVENTS: "outbox-events",
} as const;
