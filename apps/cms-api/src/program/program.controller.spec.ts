import { Test, TestingModule } from '@nestjs/testing';
import { ProgramController } from './program.controller';
import { IProgramService, PROGRAM_SERVICE, CreateProgramDto } from '~/common';

describe('ProgramController', () => {
  let controller: ProgramController;
  let programService: IProgramService;
  let createWithDtoMock: jest.Mock;

  beforeEach(async () => {
    createWithDtoMock = jest
      .fn()
      .mockResolvedValue({ id: 1, title: 'Test Program' });

    programService = {
      createWithDto: createWithDtoMock,
      bulkCreateWithDto: jest.fn(),
      findAllWithDto: jest.fn(),
      findOneWithDto: jest.fn(),
      updateWithDto: jest.fn(),
      remove: jest.fn(),
      bulkRemove: jest.fn(),
    } as unknown as IProgramService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramController],
      providers: [{ provide: PROGRAM_SERVICE, useValue: programService }],
    }).compile();

    controller = module.get<ProgramController>(ProgramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a program', async () => {
    const dto: CreateProgramDto = { title: 'Test Program' } as CreateProgramDto;
    const result = await controller.create(dto);
    expect(result).toHaveProperty('id', 1);
    expect(createWithDtoMock).toHaveBeenCalledWith(dto);
  });
});
