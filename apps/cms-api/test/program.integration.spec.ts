import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Program, Outbox, OUTBOX_SERVICE, PROGRAM_SERVICE } from '~/common';
import { ProgramMapper } from '../src/program/mappers/program.mapper';

describe('Program Integration Tests', () => {
  let app: INestApplication;

  const mockProgram = {
    id: 1,
    title: 'Test Program',
    description: 'Test Description',
    publishDate: new Date('2024-01-15'),
    type: 'podcast',
    language: 'en',
    tags: ['test', 'program'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockProgram], 1]),
    })),
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockOutboxRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockOutboxService = {
    createEvent: jest.fn(),
    createEventWithManager: jest.fn(),
    getUnprocessedEvents: jest.fn(),
    markAsProcessed: jest.fn(),
  };

  const mockProgramMapper = {
    toEntity: jest.fn(),
    toPartialEntity: jest.fn(),
    toResponseDto: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
    transaction: jest.fn(),
  };

  const mockProgramService = {
    findAllWithDto: jest.fn(),
    findOneWithDto: jest.fn(),
    createWithDto: jest.fn(),
    updateWithDto: jest.fn(),
    remove: jest.fn(),
    bulkCreateWithDto: jest.fn(),
    bulkRemove: jest.fn(),
  };

  beforeEach(async () => {
    mockProgramService.findAllWithDto.mockReset();
    mockProgramService.findOneWithDto.mockReset();
    mockProgramService.createWithDto.mockReset();
    mockProgramService.updateWithDto.mockReset();
    mockProgramService.remove.mockReset();
    mockProgramService.bulkCreateWithDto.mockReset();
    mockProgramService.bulkRemove.mockReset();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Program))
      .useValue(mockRepository)
      .overrideProvider(getRepositoryToken(Outbox))
      .useValue(mockOutboxRepository)
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .overrideProvider(OUTBOX_SERVICE)
      .useValue(mockOutboxService)
      .overrideProvider(PROGRAM_SERVICE)
      .useValue(mockProgramService)
      .overrideProvider(ProgramMapper)
      .useValue(mockProgramMapper)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /programs', () => {
    it('should return programs list with pagination', async () => {
      const mockResponse = {
        data: [
          {
            id: mockProgram.id,
            title: mockProgram.title,
            description: mockProgram.description,
            publishDate: mockProgram.publishDate.toISOString(),
            type: mockProgram.type,
            language: mockProgram.language,
            tags: mockProgram.tags,
            createdAt: mockProgram.createdAt.toISOString(),
            updatedAt: mockProgram.updatedAt.toISOString(),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockProgramService.findAllWithDto.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/programs')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBe(1);
    });

    it('should filter programs by category', async () => {
      const mockResponse = {
        data: [
          {
            id: mockProgram.id,
            title: mockProgram.title,
            description: mockProgram.description,
            publishDate: mockProgram.publishDate.toISOString(),
            type: mockProgram.type,
            language: mockProgram.language,
            tags: mockProgram.tags,
            createdAt: mockProgram.createdAt.toISOString(),
            updatedAt: mockProgram.updatedAt.toISOString(),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockProgramService.findAllWithDto.mockResolvedValue(mockResponse);

      await request(app.getHttpServer())
        .get('/programs?type=podcast')
        .expect(200);

      expect(mockProgramService.findAllWithDto).toHaveBeenCalled();
    });
  });

  describe('GET /programs/:id', () => {
    it('should return a program by id', async () => {
      const mockResponse = {
        id: mockProgram.id,
        title: mockProgram.title,
        description: mockProgram.description,
        publishDate: mockProgram.publishDate.toISOString(),
        type: mockProgram.type,
        language: mockProgram.language,
        tags: mockProgram.tags,
        createdAt: mockProgram.createdAt.toISOString(),
        updatedAt: mockProgram.updatedAt.toISOString(),
      };

      mockProgramService.findOneWithDto.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/programs/1')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe('Test Program');
    });

    it('should return 404 when program not found', async () => {
      mockProgramService.findOneWithDto.mockRejectedValue(
        new NotFoundException('Not found'),
      );
      await request(app.getHttpServer()).get('/programs/999').expect(404);
    });
  });

  describe('POST /programs', () => {
    it('should create a new program', async () => {
      const createProgramDto = {
        title: 'New Program',
        description: 'New Description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: ['new', 'program'],
      };

      const mockResponse = {
        id: 2,
        title: 'New Program',
        description: 'New Description',
        publishDate: '2024-01-15T00:00:00.000Z',
        type: 'podcast',
        language: 'en',
        tags: ['new', 'program'],
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      };

      mockProgramService.createWithDto.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/programs')
        .send(createProgramDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.title).toBe('New Program');
      expect(mockProgramService.createWithDto).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const invalidProgram = {
        description: 'Missing title',
      };
      mockProgramService.createWithDto.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );
      await request(app.getHttpServer())
        .post('/programs')
        .send(invalidProgram)
        .expect(400);
    });
  });

  describe('PATCH /programs/:id', () => {
    it('should update an existing program', async () => {
      mockProgramService.updateWithDto.mockImplementationOnce((id) => {
        if (id == 1) {
          return Promise.resolve({
            id: 1,
            title: 'Updated Program',
            description: mockProgram.description,
            publishDate: mockProgram.publishDate.toISOString(),
            type: mockProgram.type,
            language: mockProgram.language,
            tags: mockProgram.tags,
            createdAt: mockProgram.createdAt.toISOString(),
            updatedAt: mockProgram.updatedAt.toISOString(),
          });
        }
        return Promise.reject(new NotFoundException('Not found'));
      });
      const updateProgramDto = {
        title: 'Updated Program',
      };
      const response = await request(app.getHttpServer())
        .patch('/programs/1')
        .send(updateProgramDto)
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body.title).toBe('Updated Program');
    });

    it('should return 404 when program not found for update', async () => {
      const updateProgramDto = { title: 'Updated' };
      mockProgramService.updateWithDto.mockRejectedValue(
        new NotFoundException('Not found'),
      );
      await request(app.getHttpServer())
        .patch('/programs/999')
        .send(updateProgramDto)
        .expect(404);
    });
  });

  describe('DELETE /programs/:id', () => {
    it('should delete a program', async () => {
      mockProgramService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/programs/1').expect(200);

      expect(mockProgramService.remove).toHaveBeenCalled();
    });

    it('should return 404 when program not found for deletion', async () => {
      mockProgramService.remove.mockRejectedValue(
        new NotFoundException('Not found'),
      );
      await request(app.getHttpServer()).delete('/programs/999').expect(404);
    });
  });

  describe('POST /programs/bulk', () => {
    it('should create multiple programs', async () => {
      const bulkCreateDto = {
        programs: [
          {
            title: 'Program 1',
            description: 'Desc 1',
            publishDate: '2024-01-15',
            type: 'podcast',
            language: 'en',
            tags: ['test'],
          },
          {
            title: 'Program 2',
            description: 'Desc 2',
            publishDate: '2024-01-16',
            type: 'video',
            language: 'en',
            tags: ['test'],
          },
        ],
      };
      const mockResponse = {
        created: 2,
        failed: 0,
        programs: [
          {
            id: 1,
            title: 'Program 1',
            description: 'Desc 1',
            publishDate: '2024-01-15T00:00:00.000Z',
            type: 'podcast',
            language: 'en',
            tags: ['test'],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T00:00:00.000Z',
          },
          {
            id: 2,
            title: 'Program 2',
            description: 'Desc 2',
            publishDate: '2024-01-16T00:00:00.000Z',
            type: 'video',
            language: 'en',
            tags: ['test'],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T00:00:00.000Z',
          },
        ],
        errors: [],
      };
      mockProgramService.bulkCreateWithDto.mockResolvedValue(mockResponse);
      const response = await request(app.getHttpServer())
        .post('/programs/bulk')
        .send(bulkCreateDto)
        .expect(201);
      expect(response.body.created).toBe(2);
      expect(response.body.failed).toBe(0);
      expect(response.body.programs).toBeDefined();
      expect(Array.isArray(response.body.programs)).toBe(true);
      expect(response.body.programs).toHaveLength(2);
      expect(response.body.errors).toHaveLength(0);
    });
  });

  describe('DELETE /programs/bulk-delete', () => {
    it('should delete multiple programs', async () => {
      const ids = [1, 2];
      const mockResponse = {
        deleted: 2,
        failed: 0,
        errors: [],
      };
      mockProgramService.bulkRemove.mockResolvedValue(mockResponse);
      await request(app.getHttpServer())
        .post('/programs/bulk-delete')
        .send({ ids })
        .expect(201);
    });
  });
});
