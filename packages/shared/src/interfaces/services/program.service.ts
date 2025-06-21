import {
  CreateProgramDto,
  BulkCreateProgramDto,
  BulkCreateResponseDto,
  PaginationQueryDto,
  PaginatedResponseDto,
  ProgramResponseDto,
  UpdateProgramDto,
  BulkDeleteProgramDto,
  BulkDeleteResponseDto,
} from "../../dto";
import { Program } from "../../models";

// Read-only program interface
export interface IProgramReader {
  findOne(id: number): Promise<Program>;
  findAll(pagination?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Program[]; total: number }>;
}

// Write-only program interface
export interface IProgramWriter {
  create(data: CreateProgramDto): Promise<Program>;
  update(id: number, data: UpdateProgramDto): Promise<Program>;
  delete(id: number): Promise<void>;
}

// Bulk operations interface
export interface IProgramBulkOperations {
  bulkCreate(programs: CreateProgramDto[]): Promise<{
    created: number;
    failed: number;
    programs: Program[];
    errors: any[];
  }>;
  bulkDelete(
    ids: number[]
  ): Promise<{ deleted: number; failed: number; errors: any[] }>;
}

// Complete program service interface
export interface IProgramService
  extends IProgramReader,
    IProgramWriter,
    IProgramBulkOperations {
  createWithDto(
    createProgramDto: CreateProgramDto
  ): Promise<ProgramResponseDto>;
  bulkCreateWithDto(
    bulkCreateDto: BulkCreateProgramDto
  ): Promise<BulkCreateResponseDto>;
  findAllWithDto(
    pagination?: PaginationQueryDto
  ): Promise<PaginatedResponseDto<ProgramResponseDto>>;
  findOneWithDto(id: number): Promise<ProgramResponseDto>;
  updateWithDto(
    id: number,
    updateProgramDto: UpdateProgramDto
  ): Promise<ProgramResponseDto>;
  remove(id: number): Promise<void>;
  bulkRemove(
    bulkDeleteDto: BulkDeleteProgramDto
  ): Promise<BulkDeleteResponseDto>;
}
