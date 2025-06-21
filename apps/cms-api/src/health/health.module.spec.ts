import { Test, TestingModule } from '@nestjs/testing';
import { HealthModule } from './health.module';

describe('HealthModule', () => {
  it('should compile', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();
    expect(module).toBeDefined();
  });
});
