import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgramService } from './program.service';
import { Program } from '~/common';
import { CreateProgramDto, UpdateProgramDto, OUTBOX_SERVICE } from '~/common';
import { ProgramMapper } from './mappers/program.mapper';

describe('ProgramService', () => {
  let service: ProgramService;

  const mockProgram = {
    id: 1,
    title: 'Test Program',
    description: 'Test Description',
    publishDate: '2024-01-15',
    type: 'podcast',
    language: 'en',
    tags: ['test', 'program'],
    isActive: true,
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
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockProgramMapper = {
    toEntity: jest.fn(),
    toPartialEntity: jest.fn(),
    toResponseDto: jest.fn(),
  };

  const mockOutboxService = {
    createEventWithManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramService,
        {
          provide: getRepositoryToken(Program),
          useValue: mockRepository,
        },
        {
          provide: ProgramMapper,
          useValue: mockProgramMapper,
        },
        {
          provide: OUTBOX_SERVICE,
          useValue: mockOutboxService,
        },
      ],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all programs with pagination', async () => {
      const mockPrograms = [mockProgram];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([mockPrograms, total]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockPrograms);
      expect(result.total).toBe(total);
    });
  });

  describe('findOne', () => {
    it('should return a program by id', async () => {
      const id = 1;
      mockRepository.findOne.mockResolvedValue(mockProgram);

      const result = await service.findOne(id);

      expect(result).toEqual(mockProgram);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw error when program not found', async () => {
      const id = 999;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(
        'Program with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new program', async () => {
      const createProgramDto: CreateProgramDto = {
        title: 'New Program',
        description: 'New Description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: ['new', 'program'],
      };

      const mockEntity = { ...mockProgram, ...createProgramDto };
      mockProgramMapper.toEntity.mockReturnValue(mockEntity);
      mockRepository.manager.transaction.mockImplementation((callback) => {
        const mockManager = {
          create: jest.fn().mockReturnValue(mockEntity),
          save: jest.fn().mockResolvedValue(mockEntity),
          findOne: jest.fn().mockResolvedValue(mockEntity),
        };
        return callback(mockManager);
      });

      const result = await service.create(createProgramDto);

      expect(result).toEqual(mockEntity);
      expect(mockProgramMapper.toEntity).toHaveBeenCalledWith(createProgramDto);
    });
  });

  describe('update', () => {
    it('should update an existing program', async () => {
      const id = 1;
      const updateProgramDto: UpdateProgramDto = {
        title: 'Updated Program',
      };

      const updatedProgram = { ...mockProgram, ...updateProgramDto };
      mockProgramMapper.toPartialEntity.mockReturnValue(updateProgramDto);
      mockRepository.manager.transaction.mockImplementation((callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockProgram),
          save: jest.fn().mockResolvedValue(updatedProgram),
        };
        return callback(mockManager);
      });

      const result = await service.update(id, updateProgramDto);

      expect(result).toEqual(updatedProgram);
      expect(mockProgramMapper.toPartialEntity).toHaveBeenCalledWith(
        updateProgramDto,
      );
    });

    it('should throw error when program not found for update', async () => {
      const id = 999;
      const updateProgramDto: UpdateProgramDto = { title: 'Updated' };
      mockRepository.manager.transaction.mockImplementation((callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        return callback(mockManager);
      });

      await expect(service.update(id, updateProgramDto)).rejects.toThrow(
        'Program with ID 999 not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete a program', async () => {
      const id = 1;
      mockRepository.manager.transaction.mockImplementation((callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockProgram),
          remove: jest.fn().mockResolvedValue(undefined),
        };
        return callback(mockManager);
      });

      await service.delete(id);

      expect(mockRepository.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple programs', async () => {
      const createProgramDtos = [
        {
          title: 'Program 1',
          description: 'Desc 1',
          publishDate: '2024-01-15',
          type: 'podcast',
          language: 'en',
          tags: ['test'],
        } as CreateProgramDto,
        {
          title: 'Program 2',
          description: 'Desc 2',
          publishDate: '2024-01-16',
          type: 'video',
          language: 'en',
          tags: ['test'],
        } as CreateProgramDto,
      ];

      mockRepository.manager.transaction.mockImplementation((callback) => {
        const mockManager = {
          create: jest.fn().mockReturnValue(mockProgram),
          save: jest.fn().mockResolvedValue(mockProgram),
        };
        return callback(mockManager);
      });

      const result = await service.bulkCreate(createProgramDtos);

      expect(result.created).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.programs).toHaveLength(2);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple programs', async () => {
      const ids = [1, 2];

      mockRepository.manager.transaction.mockImplementation((callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockProgram),
          remove: jest.fn().mockResolvedValue(undefined),
        };
        return callback(mockManager);
      });

      const result = await service.bulkDelete(ids);

      expect(result.deleted).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle partial deletion failures', async () => {
      const ids = [1, 2, 3];

      mockRepository.manager.transaction.mockImplementation((callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockProgram),
          remove: jest.fn().mockResolvedValue(undefined),
        };
        return callback(mockManager);
      });

      const result = await service.bulkDelete(ids);

      expect(result.deleted).toBe(3);
      expect(result.failed).toBe(0);
    });
  });
});
