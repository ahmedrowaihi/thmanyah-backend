import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  BulkCreateProgramDto,
  BulkCreateResponseDto,
  BulkDeleteProgramDto,
  BulkDeleteResponseDto,
  CreateProgramDto,
  IOutboxService,
  OUTBOX_SERVICE,
  IProgramService,
  PaginatedResponseDto,
  PaginationQueryDto,
  Program,
  ProgramResponseDto,
  UpdateProgramDto,
} from '~/common';
import { ProgramMapper } from './mappers';

@Injectable()
export class ProgramService implements IProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @Inject(OUTBOX_SERVICE) private outboxService: IOutboxService,
    private programMapper: ProgramMapper,
  ) {}

  async findOne(id: number): Promise<Program> {
    const program = await this.programRepository.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  async findAll(pagination?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Program[]; total: number }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [programs, total] = await this.programRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data: programs, total };
  }

  async create(data: CreateProgramDto): Promise<Program> {
    // Use transaction to ensure both program creation and outbox event are atomic
    return this.programRepository.manager.transaction(
      async (manager: EntityManager) => {
        const programData = this.programMapper.toEntity(data);
        const program = manager.create(Program, programData);
        const savedProgram = await manager.save(Program, program);

        // Create outbox event within the same transaction
        await this.outboxService.createEventWithManager(manager, {
          eventType: 'PROGRAM_CREATED',
          payload: { programId: savedProgram.id },
        });

        return savedProgram;
      },
    );
  }

  async update(id: number, data: UpdateProgramDto): Promise<Program> {
    return this.programRepository.manager.transaction(
      async (manager: EntityManager) => {
        const program = await manager.findOne(Program, { where: { id } });
        if (!program) {
          throw new NotFoundException(`Program with ID ${id} not found`);
        }

        const updateData = this.programMapper.toPartialEntity(data);
        Object.assign(program, updateData);

        const updatedProgram = await manager.save(Program, program);

        // Create outbox event within the same transaction
        await this.outboxService.createEventWithManager(manager, {
          eventType: 'PROGRAM_UPDATED',
          payload: { programId: updatedProgram.id },
        });

        return updatedProgram;
      },
    );
  }

  async delete(id: number): Promise<void> {
    return this.programRepository.manager.transaction(
      async (manager: EntityManager) => {
        const program = await manager.findOne(Program, { where: { id } });
        if (!program) {
          throw new NotFoundException(`Program with ID ${id} not found`);
        }

        await manager.remove(Program, program);

        // Create outbox event within the same transaction
        await this.outboxService.createEventWithManager(manager, {
          eventType: 'PROGRAM_DELETED',
          payload: { programId: id },
        });
      },
    );
  }

  async bulkCreate(programs: any[]): Promise<{
    created: number;
    failed: number;
    programs: Program[];
    errors: any[];
  }> {
    const createdPrograms: Program[] = [];
    const errors: any[] = [];

    // Process each program individually to handle partial failures
    for (let i = 0; i < programs.length; i++) {
      try {
        const program = await this.create(programs[i]);
        createdPrograms.push(program);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      created: createdPrograms.length,
      failed: errors.length,
      programs: createdPrograms,
      errors,
    };
  }

  async bulkDelete(
    ids: number[],
  ): Promise<{ deleted: number; failed: number; errors: any[] }> {
    const errors: any[] = [];

    // Process each deletion individually to handle partial failures
    for (let i = 0; i < ids.length; i++) {
      try {
        await this.delete(ids[i]);
      } catch (error) {
        errors.push({
          index: i,
          id: ids[i],
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      deleted: ids.length - errors.length,
      failed: errors.length,
      errors,
    };
  }

  // Legacy methods for backward compatibility with existing DTOs
  async createWithDto(createProgramDto: unknown): Promise<ProgramResponseDto> {
    if (typeof createProgramDto !== 'object' || createProgramDto === null) {
      throw new Error('Invalid argument: createProgramDto must be an object');
    }
    const program = await this.create(createProgramDto as CreateProgramDto);
    return this.programMapper.toResponseDto(program);
  }

  async bulkCreateWithDto(
    bulkCreateDto: BulkCreateProgramDto,
  ): Promise<BulkCreateResponseDto> {
    const result = await this.bulkCreate(bulkCreateDto.programs);
    return {
      created: result.created,
      failed: result.failed,
      programs: result.programs.map((p) => this.programMapper.toResponseDto(p)),
      errors: result.errors,
    };
  }

  async findAllWithDto(
    pagination?: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ProgramResponseDto>> {
    const result = await this.findAll(pagination);
    const responseDtos = result.data.map((p) =>
      this.programMapper.toResponseDto(p),
    );

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const totalPages = Math.ceil(result.total / limit);

    return {
      data: responseDtos,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    };
  }

  async findOneWithDto(id: number): Promise<ProgramResponseDto> {
    const program = await this.findOne(id);
    return this.programMapper.toResponseDto(program);
  }

  async updateWithDto(
    id: number,
    updateProgramDto: UpdateProgramDto,
  ): Promise<ProgramResponseDto> {
    const program = await this.update(id, updateProgramDto);
    return this.programMapper.toResponseDto(program);
  }

  async remove(id: number): Promise<void> {
    return this.delete(id);
  }

  async bulkRemove(
    bulkDeleteDto: BulkDeleteProgramDto,
  ): Promise<BulkDeleteResponseDto> {
    const result = await this.bulkDelete(bulkDeleteDto.ids);
    return {
      deleted: result.deleted,
      failed: result.failed,
      errors: result.errors,
    };
  }
}
