import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  SearchFilters,
  SearchPagination,
  SearchResult,
  ISearchService,
  ISearchMapperService,
  SEARCH_MAPPER_SERVICE,
  IProgramIndexService,
  PROGRAM_INDEX_SERVICE,
} from '~/common';
import { calculatePaginationMeta } from './utils/pagination.util';

@Injectable()
export class SearchService implements ISearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(PROGRAM_INDEX_SERVICE)
    private readonly programIndexService: IProgramIndexService,
    @Inject(SEARCH_MAPPER_SERVICE)
    private readonly searchMapperService: ISearchMapperService,
  ) {}

  async searchPrograms(
    query: string,
    filters?: SearchFilters,
    pagination?: SearchPagination,
  ): Promise<SearchResult> {
    try {
      const response = await this.programIndexService.searchPrograms(
        query,
        filters,
      );

      const hits = this.searchMapperService.mapElasticsearchHitsToSearchHits(
        response.hits,
      );

      const total = response.total;
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;

      const paginationMeta = calculatePaginationMeta(total, page, limit);

      return {
        hits,
        total,
        query,
        took: 0, // Not available in the new interface
        pagination: paginationMeta,
      };
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw error;
    }
  }
}
