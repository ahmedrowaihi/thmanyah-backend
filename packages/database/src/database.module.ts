import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Outbox } from "./entities/outbox.entity";
import { Program } from "./entities/program.entity";
import { OutboxService } from "./services/outbox.service";
import { OUTBOX_SERVICE } from "@thmanyah/shared";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Program, Outbox])],
  providers: [
    OutboxService,
    { provide: OUTBOX_SERVICE, useClass: OutboxService },
  ],
  exports: [TypeOrmModule, OutboxService, OUTBOX_SERVICE],
})
export class DatabaseModule {}
