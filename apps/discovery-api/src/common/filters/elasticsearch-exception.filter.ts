import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '~/common';

interface ElasticsearchError {
  meta?: {
    statusCode?: number;
    body?: unknown;
  };
  message?: string;
}

@Catch()
export class ElasticsearchExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ElasticsearchExceptionFilter.name);

  catch(exception: ElasticsearchError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error('Elasticsearch error:', exception);

    const statusCode =
      exception.meta?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception.message || 'Search service temporarily unavailable';

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(statusCode).json(errorResponse);
  }
}
