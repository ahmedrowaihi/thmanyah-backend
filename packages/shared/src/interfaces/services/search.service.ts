import {
  SearchFilters,
  SearchHit,
  SearchPagination,
  SearchResult,
} from "../common";

export interface ISearchService {
  searchPrograms(
    query: string,
    filters?: SearchFilters,
    pagination?: SearchPagination
  ): Promise<SearchResult>;
}

export interface IMetadataService {
  getMetadata(): Promise<{
    totalPrograms: number;
    lastUpdated: Date;
  }>;
  getProgramTypes(): Promise<string[]>;
  getLanguages(): Promise<string[]>;
  getPopularTags(): Promise<string[]>;
}

export interface ISearchMapperService {
  mapElasticsearchHitsToSearchHits(hits: any[]): SearchHit[];
}
