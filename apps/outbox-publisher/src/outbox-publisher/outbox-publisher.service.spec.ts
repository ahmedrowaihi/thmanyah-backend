import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OutboxPublisherService } from './outbox-publisher.service';
import { Outbox, QueueService } from '~/common';

describe('OutboxPublisherService', () => {
  let service: OutboxPublisherService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockQueueService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxPublisherService,
        { provide: getRepositoryToken(Outbox), useValue: mockRepository },
        { provide: QueueService, useValue: mockQueueService },
      ],
    }).compile();
    service = module.get<OutboxPublisherService>(OutboxPublisherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
