import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  UseFilters,
  Version,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  SearchFilters,
  SearchPagination,
  SearchResult,
  LoggingInterceptor,
  ISearchService,
  SEARCH_SERVICE,
  IMetadataService,
  METADATA_SERVICE,
} from '~/common';
import { SearchProgramDto, SearchResultResponseDto } from './dto';
import { ElasticsearchExceptionFilter } from '~/common/filters/elasticsearch-exception.filter';

@ApiTags('Search')
@Controller('search')
@UseFilters(ElasticsearchExceptionFilter)
@UseInterceptors(LoggingInterceptor)
export class SearchController {
  constructor(
    @Inject(SEARCH_SERVICE)
    private readonly searchService: ISearchService,
    @Inject(METADATA_SERVICE)
    private readonly metadataService: IMetadataService,
  ) {}

  @Get('programs')
  @Version('1')
  @ApiOperation({
    summary: 'Search programs',
    description:
      'Search for programs using text query and optional filters with pagination support',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results returned successfully',
    type: () => SearchResultResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search parameters',
  })
  async searchPrograms(
    @Query() searchDto: SearchProgramDto,
  ): Promise<SearchResult> {
    const filters: SearchFilters = {};

    if (searchDto.type) filters.type = searchDto.type;
    if (searchDto.language) filters.language = searchDto.language;
    if (searchDto.tags) filters.tags = searchDto.tags;

    const pagination: SearchPagination = {
      page: searchDto.page || 1,
      limit: searchDto.limit || 10,
      sortBy: searchDto.sortBy || 'publishDate',
      sortOrder: searchDto.sortOrder || 'desc',
    };

    return this.searchService.searchPrograms(
      searchDto.q || '',
      filters,
      pagination,
    );
  }

  @Get('filters/types')
  @Version('1')
  @ApiOperation({ summary: 'Get available program types' })
  @ApiResponse({
    status: 200,
    description: 'List of available program types',
    type: [String],
    example: [
      'podcast',
      'video',
      'documentary',
      'interview',
      'lecture',
      'story',
    ],
  })
  async getProgramTypes(): Promise<string[]> {
    return this.metadataService.getProgramTypes();
  }

  @Get('filters/languages')
  @Version('1')
  @ApiOperation({ summary: 'Get available languages' })
  @ApiResponse({
    status: 200,
    description: 'List of available languages',
    type: [String],
    example: ['en', 'ar'],
  })
  async getLanguages(): Promise<string[]> {
    return this.metadataService.getLanguages();
  }

  @Get('filters/tags')
  @Version('1')
  @ApiOperation({ summary: 'Get popular tags' })
  @ApiResponse({
    status: 200,
    description: 'List of popular tags',
    type: [String],
    example: ['technology', 'ai', 'future', 'science', 'business'],
  })
  async getPopularTags(): Promise<string[]> {
    return this.metadataService.getPopularTags();
  }
}
