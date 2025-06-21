import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { ISearchService, SEARCH_SERVICE } from '@thmanyah/shared';
import { METADATA_SERVICE } from '~/common';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: ISearchService;

  beforeEach(async () => {
    searchService = {
      search: jest.fn(),
      getFilters: jest.fn(),
      getSuggestions: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        { provide: SEARCH_SERVICE, useValue: searchService },
        { provide: METADATA_SERVICE, useValue: {} },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
