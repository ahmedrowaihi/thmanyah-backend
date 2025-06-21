import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import {
  Program,
  QueueService,
  PROGRAM_INDEX_SERVICE,
  ProgramMapper,
} from '~/common';

describe('SyncWorker AppModule', () => {
  it('should compile', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: getRepositoryToken(Program), useValue: {} },
        { provide: QueueService, useValue: {} },
        { provide: PROGRAM_INDEX_SERVICE, useValue: {} },
        { provide: ProgramMapper, useValue: {} },
      ],
    }).compile();
    expect(module).toBeDefined();
  });
});
