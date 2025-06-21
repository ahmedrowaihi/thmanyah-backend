import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { MetadataService } from './services/metadata.service';
import { SearchMapperService } from './services/search-mapper.service';
import { ElasticsearchModule } from '~/common';
import {
  SEARCH_SERVICE,
  METADATA_SERVICE,
  SEARCH_MAPPER_SERVICE,
} from '@thmanyah/shared';

@Module({
  imports: [ElasticsearchModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchMapperService,
    MetadataService,
    { provide: SEARCH_SERVICE, useClass: SearchService },
    { provide: METADATA_SERVICE, useClass: MetadataService },
    { provide: SEARCH_MAPPER_SERVICE, useClass: SearchMapperService },
  ],
  exports: [
    SearchService,
    SEARCH_SERVICE,
    METADATA_SERVICE,
    SEARCH_MAPPER_SERVICE,
  ],
})
export class SearchModule {}
