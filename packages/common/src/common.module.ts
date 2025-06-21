import { Module } from "@nestjs/common";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";
import { RequestIdInterceptor } from "./interceptors/request-id.interceptor";
import { ResponseSanitizerInterceptor } from "./interceptors/response-sanitizer.interceptor";
import { HttpExceptionFilter } from "./filters/http-exception.filter";

@Module({
  providers: [
    LoggingInterceptor,
    RequestIdInterceptor,
    ResponseSanitizerInterceptor,
    HttpExceptionFilter,
  ],
  exports: [
    LoggingInterceptor,
    RequestIdInterceptor,
    ResponseSanitizerInterceptor,
    HttpExceptionFilter,
  ],
})
export class CommonModule {}
