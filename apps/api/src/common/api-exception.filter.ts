import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

type ErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<{ url?: string }>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = this.getResponseBody(exception);

    httpAdapter.reply(
      ctx.getResponse(),
      {
        success: false,
        message: this.getMessage(responseBody, statusCode),
        error: {
          code: this.getCode(responseBody, exception, statusCode),
          statusCode,
          ...(responseBody?.message &&
          Array.isArray(responseBody.message) &&
          responseBody.message.length > 0
            ? { details: responseBody.message }
            : {}),
        },
        meta: {
          path: request.url ?? '',
          timestamp: new Date().toISOString(),
        },
      },
      statusCode,
    );
  }

  private getResponseBody(exception: unknown): ErrorBody | undefined {
    if (!(exception instanceof HttpException)) {
      return undefined;
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { message: response };
    }

    if (response && typeof response === 'object') {
      return response as ErrorBody;
    }

    return undefined;
  }

  private getMessage(responseBody: ErrorBody | undefined, statusCode: number) {
    const message = responseBody?.message;

    if (Array.isArray(message)) {
      return message[0] ?? 'Request failed.';
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return statusCode === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'Internal server error.'
      : 'Request failed.';
  }

  private getCode(
    responseBody: ErrorBody | undefined,
    exception: unknown,
    statusCode: number,
  ) {
    if (responseBody?.error) {
      return responseBody.error;
    }

    if (exception instanceof Error) {
      return exception.name;
    }

    return HttpStatus[statusCode] ?? 'ERROR';
  }
}
