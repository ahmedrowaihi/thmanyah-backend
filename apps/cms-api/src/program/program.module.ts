import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import {
  Program,
  Outbox,
  OutboxService,
  PROGRAM_SERVICE,
  OUTBOX_SERVICE,
} from '~/common';
import { ProgramMapper } from './mappers';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Outbox])],
  controllers: [ProgramController],
  providers: [
    ProgramService,
    ProgramMapper,
    OutboxService,
    { provide: PROGRAM_SERVICE, useClass: ProgramService },
    { provide: OUTBOX_SERVICE, useClass: OutboxService },
  ],
  exports: [
    ProgramService,
    ProgramMapper,
    OutboxService,
    PROGRAM_SERVICE,
    OUTBOX_SERVICE,
  ],
})
export class ProgramModule {}
