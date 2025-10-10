import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  httpRequestCounter: Counter<string>;
  httpRequestErrorCounter: Counter<string>;
  httpRequestDuration: Histogram<string>;

  constructor() {
    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpRequestErrorCounter = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 1, 3, 5],
    });
  }

  incRequestCount(method: string, route: string, status: number) {
    if (status >= 400) {
      this.httpRequestErrorCounter.inc({ method, route, status });
    }

    this.httpRequestCounter.inc({ method, route, status });
  }

  observeRequestDuration(
    method: string,
    route: string,
    status: number,
    duration: number,
  ) {
    this.httpRequestDuration.observe({ method, route, status }, duration);
  }
}
