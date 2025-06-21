import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { SyncWorkerService } from '../src/sync-worker/sync-worker.service';

describe('Sync Worker (e2e)', () => {
  let app: INestApplication;
  let syncWorkerService: SyncWorkerService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    syncWorkerService = moduleFixture.get<SyncWorkerService>(SyncWorkerService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('SyncWorkerService', () => {
    it('should be defined', () => {
      expect(syncWorkerService).toBeDefined();
    });

    it('should be an instance of SyncWorkerService', () => {
      expect(syncWorkerService).toBeInstanceOf(SyncWorkerService);
    });

    it('should have onModuleDestroy method', () => {
      expect(typeof syncWorkerService.onModuleDestroy).toBe('function');
    });
  });
});
