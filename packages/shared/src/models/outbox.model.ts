export interface ProgramEventPayload {
  programId: number;
}

export interface OutboxEventPayload {
  [key: string]: any;
}

export interface OutboxEvent {
  eventType: string;
  payload: OutboxEventPayload;
}
