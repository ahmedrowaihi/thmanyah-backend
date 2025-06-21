import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import {
  PROGRAM_INDEX_SERVICE,
  ELASTICSEARCH_HEALTH_SERVICE,
} from '@thmanyah/shared';
import { ProgramMapper } from '@thmanyah/elasticsearch';

describe('DiscoveryAPI AppModule', () => {
  it('should compile', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PROGRAM_INDEX_SERVICE)
      .useValue({})
      .overrideProvider(ELASTICSEARCH_HEALTH_SERVICE)
      .useValue({})
      .overrideProvider(ProgramMapper)
      .useValue({})
      .compile();
    expect(module).toBeDefined();
  });
});
