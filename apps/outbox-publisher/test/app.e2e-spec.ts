import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { OutboxPublisherService } from '../src/outbox-publisher/outbox-publisher.service';

describe('Outbox Publisher (e2e)', () => {
  let app: INestApplication;
  let outboxPublisherService: OutboxPublisherService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    outboxPublisherService = moduleFixture.get<OutboxPublisherService>(
      OutboxPublisherService,
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('OutboxPublisherService', () => {
    it('should be defined', () => {
      expect(outboxPublisherService).toBeDefined();
    });

    it('should have publishOutboxEvents method', () => {
      expect(typeof outboxPublisherService.publishOutboxEvents).toBe(
        'function',
      );
    });

    it('should be an instance of OutboxPublisherService', () => {
      expect(outboxPublisherService).toBeInstanceOf(OutboxPublisherService);
    });
  });
});
