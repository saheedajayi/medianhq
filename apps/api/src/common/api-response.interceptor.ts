import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

type ApiResponsePayload<T> = {
  message?: string;
  data: T;
};

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const http = context.switchToHttp();
    const request = http.getRequest<{ url?: string }>();
    const response = http.getResponse<{
      getHeader?: (name: string) => unknown;
    }>();
    const contentType = String(
      response.getHeader?.('content-type') ??
        response.getHeader?.('Content-Type') ??
        '',
    );

    if (
      request.url === '/health' ||
      request.url?.includes('/export') ||
      contentType.includes('text/csv')
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const payload = this.getPayload(data);

        return {
          success: true,
          message: payload.message,
          data: payload.data,
          meta: {
            path: request.url ?? '',
            timestamp: new Date().toISOString(),
          },
        };
      }),
    ) as Observable<T>;
  }

  private getPayload(data: T): ApiResponsePayload<unknown> {
    if (this.isCustomPayload(data)) {
      return {
        message: data.message?.trim() || 'Request successful.',
        data: data.data,
      };
    }

    return {
      message: 'Request successful.',
      data,
    };
  }

  private isCustomPayload(data: T): data is T & ApiResponsePayload<unknown> {
    return (
      !!data &&
      typeof data === 'object' &&
      'data' in data &&
      ('message' in data
        ? typeof (data as { message?: unknown }).message === 'string'
        : true)
    );
  }
}
