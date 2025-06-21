import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PROGRAM_INDEX_SERVICE, SEARCH_MAPPER_SERVICE } from '~/common';

describe('SearchService', () => {
  let service: SearchService;

  const mockSearchHits = [
    {
      id: 1,
      title: 'Test Program',
      description: 'Test Description',
      publishDate: '2024-01-15',
      type: 'podcast',
      language: 'en',
      tags: ['test', 'program'],
      score: 0.95,
    },
  ];

  const mockElasticsearchResponse = {
    hits: [
      {
        _source: {
          id: 1,
          title: 'Test Program',
          description: 'Test Description',
          publishDate: '2024-01-15',
          type: 'podcast',
          language: 'en',
          tags: ['test', 'program'],
        },
        _score: 0.95,
      },
    ],
    total: 1,
  };

  const mockProgramIndexService = {
    searchPrograms: jest.fn(),
  };

  const mockSearchMapperService = {
    mapElasticsearchHitsToSearchHits: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PROGRAM_INDEX_SERVICE,
          useValue: mockProgramIndexService,
        },
        {
          provide: SEARCH_MAPPER_SERVICE,
          useValue: mockSearchMapperService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchPrograms', () => {
    it('should search programs with query', async () => {
      const query = 'test';
      const filters = { type: 'podcast', language: 'en' };
      const pagination = { page: 1, limit: 10 };

      mockProgramIndexService.searchPrograms.mockResolvedValue(
        mockElasticsearchResponse,
      );
      mockSearchMapperService.mapElasticsearchHitsToSearchHits.mockReturnValue(
        mockSearchHits,
      );

      const result = await service.searchPrograms(query, filters, pagination);

      expect(result.hits).toEqual(mockSearchHits);
      expect(result.total).toBe(1);
      expect(result.query).toBe(query);
      expect(result.pagination).toBeDefined();
      expect(mockProgramIndexService.searchPrograms).toHaveBeenCalledWith(
        query,
        filters,
      );
    });

    it('should search programs without filters', async () => {
      const query = 'test';
      const pagination = { page: 1, limit: 10 };

      mockProgramIndexService.searchPrograms.mockResolvedValue(
        mockElasticsearchResponse,
      );
      mockSearchMapperService.mapElasticsearchHitsToSearchHits.mockReturnValue(
        mockSearchHits,
      );

      const result = await service.searchPrograms(query, undefined, pagination);

      expect(result.hits).toEqual(mockSearchHits);
      expect(result.total).toBe(1);
      expect(mockProgramIndexService.searchPrograms).toHaveBeenCalledWith(
        query,
        undefined,
      );
    });

    it('should handle empty search results', async () => {
      const query = 'nonexistent';
      const pagination = { page: 1, limit: 10 };

      const emptyResponse = {
        hits: [],
        total: 0,
      };

      mockProgramIndexService.searchPrograms.mockResolvedValue(emptyResponse);
      mockSearchMapperService.mapElasticsearchHitsToSearchHits.mockReturnValue(
        [],
      );

      const result = await service.searchPrograms(query, undefined, pagination);

      expect(result.hits).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.pagination!.total).toBe(0);
    });

    it('should use default pagination when not provided', async () => {
      const query = 'test';

      mockProgramIndexService.searchPrograms.mockResolvedValue(
        mockElasticsearchResponse,
      );
      mockSearchMapperService.mapElasticsearchHitsToSearchHits.mockReturnValue(
        mockSearchHits,
      );

      const result = await service.searchPrograms(query);

      expect(result.pagination!.page).toBe(1);
      expect(result.pagination!.limit).toBe(10);
    });

    it('should handle search errors', async () => {
      const query = 'test';
      const error = new Error('Search failed');

      mockProgramIndexService.searchPrograms.mockRejectedValue(error);

      await expect(service.searchPrograms(query)).rejects.toThrow(
        'Search failed',
      );
    });
  });
});
