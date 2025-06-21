import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('CMS API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('status');
          expect((res.body as { status: string }).status).toBe('ok');
        });
    });
  });

  describe('/programs (GET)', () => {
    it('should return programs list', () => {
      return request(app.getHttpServer())
        .get('/programs')
        .expect(200)
        .expect((res: request.Response) => {
          expect(Array.isArray((res.body as { data: unknown[] }).data)).toBe(
            true,
          );
          expect(res.body).toHaveProperty('meta');
        });
    });
  });
});
