// Re-export shared packages for CMS API
export { configureApp, logStartupInfo } from '@thmanyah/common';
export { config } from '@thmanyah/config';
export { typeOrmConfig } from '@thmanyah/database';
export { Program, Outbox, OutboxService } from '@thmanyah/database';
export { ApiErrorResponse } from '@thmanyah/shared';

// Re-export DTOs from shared package
export {
  CreateProgramDto,
  UpdateProgramDto,
  ProgramResponseDto,
  BulkCreateProgramDto,
  BulkCreateResponseDto,
  BulkDeleteProgramDto,
  BulkDeleteResponseDto,
  PaginationQueryDto,
  PaginatedResponseDto,
} from '@thmanyah/shared';

// Re-export interfaces from shared package
export {
  IProgramService,
  PROGRAM_SERVICE,
  IOutboxService,
  OUTBOX_SERVICE,
  ISearchService,
  SEARCH_SERVICE,
  ISearchMapperService,
  SEARCH_MAPPER_SERVICE,
  IMetadataService,
  METADATA_SERVICE,
} from '@thmanyah/shared';

// Local exports
export { ProgramMapper } from '../program/mappers';
export { DatabaseExceptionFilter } from './filters/database-exception.filter';
