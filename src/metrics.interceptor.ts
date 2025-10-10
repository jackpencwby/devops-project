import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';
import { performance } from 'perf_hooks';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const route = req.route?.path || 'unknown';
        const start = performance.now();

        return next.handle().pipe(
            tap(() => {
                const res = context.switchToHttp().getResponse();
                const status = res.statusCode;
                const duration = (performance.now() - start) / 1000;

                this.metricsService.incRequestCount(method, route, status);
                this.metricsService.observeRequestDuration(method, route, status, duration);
            }),
        );
    }
}
