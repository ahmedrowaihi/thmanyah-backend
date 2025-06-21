// Search pagination interface
export interface SearchPagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Search filters interface
export interface SearchFilters {
  type?: string;
  language?: string;
  tags?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
}

// Search hit interface
export interface SearchHit {
  id: number;
  title: string;
  description: string;
  publishDate: string;
  type: string;
  language: string;
  tags: string[];
  score?: number;
}

// Pagination metadata interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Search result interface
export interface SearchResult {
  hits: SearchHit[];
  total: number;
  query: string;
  took: number;
  pagination?: PaginationMeta;
}
