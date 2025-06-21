import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { ApiErrorResponse } from "@thmanyah/shared";

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    this.logger.error(
      `HTTP Exception: ${status} - ${JSON.stringify(exceptionResponse)}`
    );

    let message: string;
    if (typeof exceptionResponse === "string") {
      message = exceptionResponse;
    } else {
      const response = exceptionResponse as ExceptionResponse;
      message = Array.isArray(response.message)
        ? response.message[0]
        : response.message || exception.message;
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorResponse);
  }
}
