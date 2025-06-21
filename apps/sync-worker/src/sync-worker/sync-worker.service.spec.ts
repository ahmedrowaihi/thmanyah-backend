import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SyncWorkerService } from './sync-worker.service';
import {
  Program,
  QueueService,
  PROGRAM_INDEX_SERVICE,
  ProgramMapper,
} from '~/common';

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const mockQueueService = {};
const mockProgramIndexService = {};
const mockProgramMapper = {};

describe('SyncWorkerService', () => {
  let service: SyncWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncWorkerService,
        { provide: getRepositoryToken(Program), useValue: mockRepository },
        { provide: QueueService, useValue: mockQueueService },
        { provide: PROGRAM_INDEX_SERVICE, useValue: mockProgramIndexService },
        { provide: ProgramMapper, useValue: mockProgramMapper },
      ],
    }).compile();
    service = module.get<SyncWorkerService>(SyncWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
