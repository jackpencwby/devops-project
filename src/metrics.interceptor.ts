import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';
import { performance } from 'perf_hooks';
import { Request, Response } from 'express';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;
    const route = req.url;
    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const status = res.statusCode;
        const duration = (performance.now() - start) / 1000;

        this.metricsService.incRequestCount(method, route, status);
        this.metricsService.observeRequestDuration(
          method,
          route,
          status,
          duration,
        );
      }),
    );
  }
}
