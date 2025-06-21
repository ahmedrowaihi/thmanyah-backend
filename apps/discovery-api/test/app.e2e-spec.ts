import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Discovery API (e2e)', () => {
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

  describe('/search (GET)', () => {
    it('should return search results', () => {
      return request(app.getHttpServer())
        .get('/search/programs')
        .expect(200)
        .expect((res: request.Response) => {
          expect(Array.isArray((res.body as { hits: unknown[] }).hits)).toBe(
            true,
          );
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('query');
          expect(res.body).toHaveProperty('took');
          expect(res.body).toHaveProperty('pagination');

          // Validate pagination structure
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('limit');
          expect(res.body.pagination).toHaveProperty('total');
          expect(res.body.pagination).toHaveProperty('totalPages');
        });
    });

    it('should handle search with query parameters', () => {
      return request(app.getHttpServer())
        .get('/search/programs?q=test&page=1&limit=10')
        .expect(200)
        .expect((res: request.Response) => {
          expect(Array.isArray((res.body as { hits: unknown[] }).hits)).toBe(
            true,
          );
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('query');
          expect(res.body).toHaveProperty('took');
          expect(res.body).toHaveProperty('pagination');

          // Validate pagination structure
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('limit');
          expect(res.body.pagination).toHaveProperty('total');
          expect(res.body.pagination).toHaveProperty('totalPages');

          // Validate pagination values
          expect(typeof res.body.pagination.page).toBe('number');
          expect(typeof res.body.pagination.limit).toBe('number');
          expect(typeof res.body.pagination.total).toBe('number');
          expect(typeof res.body.pagination.totalPages).toBe('number');
        });
    });
  });
});
