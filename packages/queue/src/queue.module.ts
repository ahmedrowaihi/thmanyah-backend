import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { QUEUE_SERVICE } from "@thmanyah/shared";

@Module({
  providers: [QueueService, { provide: QUEUE_SERVICE, useClass: QueueService }],
  exports: [QueueService, QUEUE_SERVICE],
})
export class QueueModule {}
