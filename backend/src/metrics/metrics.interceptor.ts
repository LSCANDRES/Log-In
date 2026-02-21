import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const duration = (Date.now() - start) / 1000;

        // Normalizar la ruta (reemplazar IDs por :id)
        const route = req.route?.path || req.path;
        const normalizedRoute = route.replace(
          /\/[0-9a-fA-F-]{36}/g,
          '/:id',
        );

        this.metricsService.httpRequestDuration
          .labels(req.method, normalizedRoute, String(res.statusCode))
          .observe(duration);
      }),
    );
  }
}
