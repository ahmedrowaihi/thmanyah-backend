import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { Outbox, QueueService } from '~/common';

describe('OutboxPublisher AppModule', () => {
  it('should compile', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: getRepositoryToken(Outbox), useValue: {} },
        { provide: QueueService, useValue: {} },
      ],
    }).compile();
    expect(module).toBeDefined();
  });
});
