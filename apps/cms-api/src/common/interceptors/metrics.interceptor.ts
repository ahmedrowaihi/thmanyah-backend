import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    // Log request start
    this.logger.log(
      `Incoming ${method} ${url} from ${ip} - User-Agent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(`${method} ${url} - ${duration}ms - Status: Success`);

          // Here you could send metrics to your monitoring system
          // Example: Prometheus, DataDog, New Relic, etc.
          this.recordMetrics(method, url, duration, 'success');
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `${method} ${url} - ${duration}ms - Status: Error - ${errorMessage}`,
          );

          // Record error metrics
          this.recordMetrics(method, url, duration, 'error');
        },
      }),
    );
  }

  private recordMetrics(
    method: string,
    url: string,
    duration: number,
    status: 'success' | 'error',
  ): void {
    // This is where you'd integrate with your metrics system
    // Examples:

    // Prometheus
    // httpRequestDuration.observe({ method, url, status }, duration);
    // httpRequestTotal.inc({ method, url, status });

    // DataDog
    // datadog.increment('http.requests', { method, url, status });
    // datadog.histogram('http.request.duration', duration, { method, url, status });

    // Custom metrics storage
    const metric = {
      timestamp: new Date().toISOString(),
      method,
      url,
      duration,
      status,
      service: 'cms-api',
    };

    // For now, just log the metric
    this.logger.debug('Metric recorded:', metric);
  }
}
