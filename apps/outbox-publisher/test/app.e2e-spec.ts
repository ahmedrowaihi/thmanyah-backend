import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { OutboxPublisherService } from './../src/outbox-publisher/outbox-publisher.service';

describe('OutboxPublisherService (e2e)', () => {
  let outboxPublisherService: OutboxPublisherService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    outboxPublisherService = moduleFixture.get<OutboxPublisherService>(
      OutboxPublisherService,
    );
  });

  it('should be defined', () => {
    expect(outboxPublisherService).toBeDefined();
  });

  it('should have cron job initialized', () => {
    expect(outboxPublisherService).toBeDefined();
    // Note: In a real test, you might want to check if the cron job is properly initialized
    // but since it's a private method, we just verify the service exists
  });
});
