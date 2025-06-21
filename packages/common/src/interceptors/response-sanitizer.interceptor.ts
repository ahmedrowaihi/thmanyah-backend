import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request } from "express";

@Injectable()
export class ResponseSanitizerInterceptor implements NestInterceptor {
  private readonly sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
    "cookie",
    "session",
    "credential",
    "apiKey",
    "privateKey",
    "secretKey",
  ];

  private sanitizeObject(obj: unknown): unknown {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized = { ...(obj as Record<string, unknown>) };

    for (const field of this.sensitiveFields) {
      if (sanitized[field] !== undefined) {
        delete sanitized[field];
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (sanitized[key] && typeof sanitized[key] === "object") {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Don't sanitize health check responses
        const request = context.switchToHttp().getRequest<Request>();
        if (request.url.startsWith("/health")) {
          return data;
        }

        return this.sanitizeObject(data);
      })
    );
  }
}
