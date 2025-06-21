import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { randomUUID } from "crypto";

// Extend Request interface to include requestId
interface RequestWithId extends Request {
  requestId?: string;
}

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const response = context.switchToHttp().getResponse<Response>();

    // Use existing request ID or generate new one
    const requestId =
      (request.headers["x-request-id"] as string) || randomUUID();

    // Set request ID in request context for logging
    request.requestId = requestId;

    // Add to response headers
    response.setHeader("x-request-id", requestId);

    return next.handle();
  }
}
