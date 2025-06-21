import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

function unique(str: string) {
  return `${str}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('API Contract Tests', () => {
  let app: INestApplication;
  const createdProgramIds: number[] = [];
  const uniqueTag = unique('contract-test');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up all created programs
    for (const id of createdProgramIds) {
      try {
        await request(app.getHttpServer()).delete(`/programs/${id}`);
      } catch {
        /* intentionally empty */
      }
    }
    await app.close();
  });

  describe('Program Response Contract', () => {
    let testProgramId: number;
    let testTitle: string;

    beforeEach(async () => {
      // Create a test program for GET operations
      testTitle = unique('Contract Test Program');
      const createDto = {
        title: testTitle,
        description: 'Test Description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: [uniqueTag],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/programs')
        .send(createDto)
        .expect(201);

      testProgramId = createResponse.body.id;
      createdProgramIds.push(testProgramId);
    });

    it('should maintain ProgramResponseDto contract', async () => {
      const response = await request(app.getHttpServer())
        .get(`/programs/${testProgramId}`)
        .expect(200);

      // Validate required fields exist
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('publishDate');
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('language');
      expect(response.body).toHaveProperty('tags');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // Validate data types
      expect(typeof response.body.id).toBe('number');
      expect(typeof response.body.title).toBe('string');
      expect(typeof response.body.description).toBe('string');
      expect(typeof response.body.publishDate).toBe('string');
      expect(typeof response.body.type).toBe('string');
      expect(typeof response.body.language).toBe('string');
      expect(Array.isArray(response.body.tags)).toBe(true);
      expect(typeof response.body.createdAt).toBe('string');
      expect(typeof response.body.updatedAt).toBe('string');

      // Validate date format (ISO string)
      expect(new Date(response.body.publishDate).toISOString()).toBe(
        response.body.publishDate,
      );
      expect(new Date(response.body.createdAt).toISOString()).toBe(
        response.body.createdAt,
      );
      expect(new Date(response.body.updatedAt).toISOString()).toBe(
        response.body.updatedAt,
      );
    });

    it('should maintain PaginatedResponseDto contract', async () => {
      // Create a program with the unique tag to ensure we have data to test
      const testTitle = unique('Contract Test Program');
      const createDto = {
        title: testTitle,
        description: 'Test Description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: [uniqueTag],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/programs')
        .send(createDto)
        .expect(201);

      const createdProgramId = createResponse.body.id;
      createdProgramIds.push(createdProgramId);

      const response = await request(app.getHttpServer())
        .get(`/programs?tags=${uniqueTag}`)
        .expect(200);

      // Only assert on programs with our unique tag
      const filtered = response.body.data.filter((p: any) =>
        p.tags.includes(uniqueTag),
      );
      expect(filtered.length).toBeGreaterThan(0);

      // Validate required fields exist
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');

      // Validate data structure
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.meta).toBe('object');

      // Validate meta fields
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('totalPages');

      // Validate data types
      expect(typeof response.body.meta.total).toBe('number');
      expect(typeof response.body.meta.page).toBe('number');
      expect(typeof response.body.meta.limit).toBe('number');
      expect(typeof response.body.meta.totalPages).toBe('number');

      // Validate pagination logic
      expect(response.body.meta.page).toBeGreaterThan(0);
      expect(response.body.meta.limit).toBeGreaterThan(0);
      expect(response.body.meta.total).toBeGreaterThanOrEqual(0);
      expect(response.body.meta.totalPages).toBeGreaterThanOrEqual(0);

      // Validate totalPages calculation
      const expectedTotalPages = Math.ceil(
        response.body.meta.total / response.body.meta.limit,
      );
      expect(response.body.meta.totalPages).toBe(expectedTotalPages);
    });

    it('should maintain BulkCreateResponseDto contract', async () => {
      const bulkTitle = unique('Contract Test Program');
      const bulkCreateDto = {
        programs: [
          {
            title: bulkTitle,
            description: 'Test Description',
            publishDate: '2024-01-15',
            type: 'podcast',
            language: 'en',
            tags: [uniqueTag],
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/programs/bulk')
        .send(bulkCreateDto)
        .expect(201);

      // Validate required fields exist
      expect(response.body).toHaveProperty('created');
      expect(response.body).toHaveProperty('failed');
      expect(response.body).toHaveProperty('programs');
      expect(response.body).toHaveProperty('errors');

      // Validate data types
      expect(typeof response.body.created).toBe('number');
      expect(typeof response.body.failed).toBe('number');
      expect(Array.isArray(response.body.programs)).toBe(true);
      expect(Array.isArray(response.body.errors)).toBe(true);

      // Validate business logic
      expect(response.body.created).toBeGreaterThanOrEqual(0);
      expect(response.body.failed).toBeGreaterThanOrEqual(0);
      expect(response.body.created + response.body.failed).toBe(
        bulkCreateDto.programs.length,
      );

      // Clean up
      for (const p of response.body.programs) {
        createdProgramIds.push(p.id);
        await request(app.getHttpServer()).delete(`/programs/${p.id}`);
      }
    });

    it('should maintain BulkDeleteResponseDto contract', async () => {
      // Create programs to delete
      const toDeleteTitle = unique('ToDelete');
      const createResponse = await request(app.getHttpServer())
        .post('/programs')
        .send({
          title: toDeleteTitle,
          description: 'desc',
          publishDate: '2024-01-15',
          type: 'podcast',
          language: 'en',
          tags: [uniqueTag],
        })
        .expect(201);
      const idToDelete = createResponse.body.id;
      createdProgramIds.push(idToDelete);
      const response = await request(app.getHttpServer())
        .post('/programs/bulk-delete')
        .send({ ids: [idToDelete] })
        .expect(201);

      // Validate required fields exist
      expect(response.body).toHaveProperty('deleted');
      expect(response.body).toHaveProperty('failed');
      expect(response.body).toHaveProperty('errors');

      // Validate data types
      expect(typeof response.body.deleted).toBe('number');
      expect(typeof response.body.failed).toBe('number');
      expect(Array.isArray(response.body.errors)).toBe(true);

      // Validate business logic
      expect(response.body.deleted).toBeGreaterThanOrEqual(0);
      expect(response.body.failed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Response Contract', () => {
    it('should maintain consistent error response format', async () => {
      const response = await request(app.getHttpServer())
        .get('/programs/999999')
        .expect(404);

      // Validate error response structure
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');

      // Validate data types
      expect(typeof response.body.statusCode).toBe('number');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.error).toBe('string');

      // Validate values
      expect(response.body.statusCode).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });

    it('should maintain validation error format', async () => {
      const invalidProgram = {
        description: 'Missing required title',
      };

      const response = await request(app.getHttpServer())
        .post('/programs')
        .send(invalidProgram)
        .expect(400);

      // Validate error response structure
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');

      // Validate data types
      expect(typeof response.body.statusCode).toBe('number');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.error).toBe('string');

      // Validate values
      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });
  });

  describe('HTTP Status Code Contract', () => {
    let testProgramId: number;

    beforeEach(async () => {
      // Create a test program for GET operations
      const createDto = {
        title: 'Status Test Program',
        description: 'Test Description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: ['status', 'test'],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/programs')
        .send(createDto)
        .expect(201);

      testProgramId = createResponse.body.id;
    });

    afterEach(async () => {
      // Clean up the test program
      if (testProgramId) {
        try {
          await request(app.getHttpServer())
            .delete(`/programs/${testProgramId}`)
            .expect(200);
        } catch {
          /* intentionally empty */
        }
      }
    });

    it('should return correct status codes for all operations', async () => {
      // GET operations should return 200
      await request(app.getHttpServer()).get('/programs').expect(200);
      await request(app.getHttpServer())
        .get(`/programs/${testProgramId}`)
        .expect(200);

      // POST operations should return 201
      const createDto = {
        title: 'Status Test',
        description: 'Test Description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: ['test'],
      };
      await request(app.getHttpServer())
        .post('/programs')
        .send(createDto)
        .expect(201);

      // PATCH operations should return 200 (create a fresh program for update)
      const updateProgramDto = {
        title: 'Update Test Program',
        description: 'Test Description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: ['test'],
      };
      const updateProgramResponse = await request(app.getHttpServer())
        .post('/programs')
        .send(updateProgramDto)
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/programs/${updateProgramResponse.body.id}`)
        .send({ title: 'Updated' })
        .expect(200);

      // DELETE operations should return 200 (test with a different program)
      const deleteProgramDto = {
        title: 'Delete Test Program',
        description: 'Test Description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: ['test'],
      };
      const deleteProgramResponse = await request(app.getHttpServer())
        .post('/programs')
        .send(deleteProgramDto)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/programs/${deleteProgramResponse.body.id}`)
        .expect(200);

      // Bulk operations should return 201
      await request(app.getHttpServer())
        .post('/programs/bulk')
        .send({ programs: [] })
        .expect(201);
      await request(app.getHttpServer())
        .post('/programs/bulk-delete')
        .send({ ids: [] })
        .expect(201);
    });
  });
});
