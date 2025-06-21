import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseFilters,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  DatabaseExceptionFilter,
  IProgramService,
  PROGRAM_SERVICE,
  CreateProgramDto,
  BulkCreateProgramDto,
  BulkCreateResponseDto,
  PaginationQueryDto,
  PaginatedResponseDto,
  ProgramResponseDto,
  UpdateProgramDto,
  BulkDeleteProgramDto,
  BulkDeleteResponseDto,
} from '~/common';

@ApiTags('programs')
@Controller('programs')
@UseFilters(DatabaseExceptionFilter)
export class ProgramController {
  constructor(
    @Inject(PROGRAM_SERVICE)
    private readonly programService: IProgramService,
  ) {}

  @Post()
  @Version('1')
  @ApiOperation({ summary: 'Create a new program' })
  @ApiResponse({
    status: 201,
    description: 'Program created successfully',
    type: () => ProgramResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createProgramDto: CreateProgramDto,
  ): Promise<ProgramResponseDto> {
    return this.programService.createWithDto(createProgramDto);
  }

  @Post('bulk')
  @Version('1')
  @ApiOperation({ summary: 'Create multiple programs in bulk' })
  @ApiResponse({
    status: 201,
    description: 'Bulk programs creation completed',
    type: () => BulkCreateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkCreate(
    @Body() bulkCreateDto: BulkCreateProgramDto,
  ): Promise<BulkCreateResponseDto> {
    return this.programService.bulkCreateWithDto(bulkCreateDto);
  }

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all programs' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Programs retrieved successfully',
    type: () => PaginatedResponseDto,
  })
  async findAll(
    @Query() pagination?: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ProgramResponseDto>> {
    return this.programService.findAllWithDto(pagination);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get a program by ID' })
  @ApiResponse({
    status: 200,
    description: 'Program found',
    type: () => ProgramResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProgramResponseDto> {
    return this.programService.findOneWithDto(id);
  }

  @Patch(':id')
  @Version('1')
  @ApiOperation({ summary: 'Update a program' })
  @ApiResponse({
    status: 200,
    description: 'Program updated successfully',
    type: () => ProgramResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramDto: UpdateProgramDto,
  ): Promise<ProgramResponseDto> {
    return this.programService.updateWithDto(id, updateProgramDto);
  }

  @Delete(':id')
  @Version('1')
  @ApiOperation({ summary: 'Delete a program' })
  @ApiResponse({ status: 200, description: 'Program deleted successfully' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.programService.remove(id);
    return { message: 'Program deleted successfully' };
  }

  @Post('bulk-delete')
  @Version('1')
  @ApiOperation({ summary: 'Delete multiple programs in bulk' })
  @ApiResponse({
    status: 200,
    description: 'Bulk programs deletion completed',
    type: () => BulkDeleteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteProgramDto,
  ): Promise<BulkDeleteResponseDto> {
    return this.programService.bulkRemove(bulkDeleteDto);
  }
}
