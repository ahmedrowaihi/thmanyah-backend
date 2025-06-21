import { ApiProperty } from '@nestjs/swagger';
import { SearchHit, SearchResult, PaginationMeta } from '~/common';

export class SearchHitDto {
  @ApiProperty({
    description: 'The unique identifier of the program',
    example: 18,
  })
  id: number;

  @ApiProperty({
    description: 'The title of the program',
    example: 'Cybersecurity Essentials',
  })
  title: string;

  @ApiProperty({
    description: 'The description of the program',
    example: 'Essential cybersecurity practices for everyone',
  })
  description: string;

  @ApiProperty({
    description: 'The publish date of the program',
    example: '2024-02-25T11:00:00.000Z',
  })
  publishDate: string;

  @ApiProperty({
    description: 'The type of the program',
    example: 'lecture',
    enum: ['podcast', 'video', 'documentary', 'interview', 'lecture', 'story'],
  })
  type: string;

  @ApiProperty({
    description: 'The language of the program',
    example: 'en',
    enum: ['en', 'ar'],
  })
  language: string;

  @ApiProperty({
    description: 'Tags associated with the program',
    example: ['security', 'cybersecurity', 'technology'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Search relevance score',
    example: 0,
    required: false,
  })
  score?: number;
}

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 18,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 2,
  })
  totalPages: number;
}

export class SearchResultResponseDto implements SearchResult {
  @ApiProperty({
    description: 'Array of search results',
    type: [SearchHitDto],
  })
  hits: SearchHit[];

  @ApiProperty({
    description: 'Total number of results found',
    example: 18,
  })
  total: number;

  @ApiProperty({
    description: 'Time taken for the search query in milliseconds',
    example: 45,
  })
  took: number;

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  pagination: PaginationMeta;

  @ApiProperty({
    description: 'Query used for the search',
    example: 'cybersecurity',
  })
  query: string;
}
