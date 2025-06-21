import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

interface ErrorWithStatus {
  status?: number;
  message?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== "object") {
      return data;
    }

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
      "cookie",
      "session",
      "credential",
    ];

    const sanitized = { ...(data as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (sanitized[key] && typeof sanitized[key] === "object") {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  private shouldLogBody(method: string, url: string): boolean {
    // Don't log bodies for sensitive endpoints
    const sensitiveEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/users/password",
    ];

    return !sensitiveEndpoints.some((endpoint) => url.includes(endpoint));
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const query = this.sanitizeData(request.query);
    const body = this.shouldLogBody(method, url)
      ? this.sanitizeData(request.body as Record<string, unknown>)
      : "[REDACTED]";
    const userAgent = request.get("User-Agent") || "";
    const startTime = Date.now();

    this.logger.log(
      `${method} ${url} - Query: ${JSON.stringify(query)} - Body: ${JSON.stringify(body)} - User-Agent: ${userAgent}`
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          this.logger.log(
            `${method} ${url} - ${response.statusCode} - ${duration}ms`
          );
        },
        error: (error: ErrorWithStatus) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          this.logger.error(
            `${method} ${url} - ${error.status || 500} - ${duration}ms - ${error.message || "Unknown error"}`
          );
        },
      })
    );
  }
}
