import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { ApiErrorResponse } from '~/common';

@Catch(QueryFailedError, EntityNotFoundError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(
    exception: QueryFailedError | EntityNotFoundError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error('Database error:', exception);

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';

    if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
    } else if (exception instanceof QueryFailedError) {
      // Check for common database errors
      const errorMessage = exception.message.toLowerCase();
      if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('unique')
      ) {
        statusCode = HttpStatus.CONFLICT;
        message = 'Resource already exists';
      } else if (errorMessage.includes('foreign key')) {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference';
      }
    }

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
