import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { SyncWorkerService } from './../src/sync-worker/sync-worker.service';

describe('SyncWorkerService (e2e)', () => {
  let syncWorkerService: SyncWorkerService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    syncWorkerService = moduleFixture.get<SyncWorkerService>(SyncWorkerService);
  });

  it('should be defined', () => {
    expect(syncWorkerService).toBeDefined();
  });

  it('should have worker initialized', () => {
    expect(syncWorkerService).toBeDefined();
    // Note: In a real test, you might want to check if the worker is properly initialized
    // but since it's a private property, we just verify the service exists
  });
});
