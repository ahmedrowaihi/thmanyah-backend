import { Injectable } from '@nestjs/common';
import { SearchHit, ISearchMapperService } from '~/common';

interface SearchHitData {
  id: number;
  title: string;
  description: string;
  publishDate: string;
  type: string;
  language: string;
  tags: string[];
  _score?: number;
}

@Injectable()
export class SearchMapperService implements ISearchMapperService {
  /**
   * Maps Elasticsearch hits to basic search hits
   */
  mapElasticsearchHitsToSearchHits(hits: SearchHitData[]): SearchHit[] {
    return hits.map((hit: SearchHitData) => this.mapToSearchHit(hit));
  }

  /**
   * Maps Elasticsearch hit to basic search hit
   */
  mapToSearchHit(hit: SearchHitData): SearchHit {
    return {
      id: hit.id,
      title: hit.title,
      description: hit.description,
      publishDate: hit.publishDate,
      type: hit.type,
      language: hit.language,
      tags: hit.tags,
      score: hit._score || 0,
    };
  }
}
