import { Test, TestingModule } from '@nestjs/testing';
import { ProgramModule } from './program.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Program, Outbox } from '~/common';
import { DataSource } from 'typeorm';

describe('ProgramModule', () => {
  it('should compile', async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      })),
    };
    const mockDataSource = {};

    const module: TestingModule = await Test.createTestingModule({
      imports: [ProgramModule],
    })
      .overrideProvider(getRepositoryToken(Program))
      .useValue(mockRepository)
      .overrideProvider(getRepositoryToken(Outbox))
      .useValue(mockRepository)
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .compile();
    expect(module).toBeDefined();
  });
});
