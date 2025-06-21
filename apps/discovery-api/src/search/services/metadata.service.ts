import { Injectable } from '@nestjs/common';
import { IMetadataService } from '@thmanyah/shared';

@Injectable()
export class MetadataService implements IMetadataService {
  getProgramTypes(): Promise<string[]> {
    // This would typically query Elasticsearch for unique types
    // For now, returning common types
    return Promise.resolve([
      'podcast',
      'documentary',
      'interview',
      'lecture',
      'story',
    ]);
  }

  getLanguages(): Promise<string[]> {
    // This would typically query Elasticsearch for unique languages
    // For now, returning common languages
    return Promise.resolve(['ar', 'en', 'fr', 'es', 'de']);
  }

  getPopularTags(): Promise<string[]> {
    // This would typically query Elasticsearch for popular tags
    // For now, returning sample tags
    return Promise.resolve([
      'technology',
      'science',
      'history',
      'philosophy',
      'literature',
    ]);
  }

  getMetadata(): Promise<{ totalPrograms: number; lastUpdated: Date }> {
    // TODO: Implement actual logic or fetch from DB/ES
    return Promise.resolve({
      totalPrograms: 0,
      lastUpdated: new Date(),
    });
  }
}
