import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const baseUrl = this.configService.getOrThrow<string>('WEB_ORIGIN');

    this.logger.warn(
      `OAuth error encountered on ${request.url}: ${
        exception instanceof Error ? exception.message : exception
      }`,
    );

    const queryError = (request.query?.error as string) || '';
    const queryErrorDesc = (request.query?.error_description as string) || '';

    let message = 'Social authentication failed. Please try again.';

    if (
      queryError === 'access_denied' ||
      queryError === 'user_cancelled_login' ||
      queryError === 'user_cancelled_authorize'
    ) {
      message = 'Sign-in was cancelled.';
    } else if (queryErrorDesc) {
      message = queryErrorDesc;
    } else if (exception instanceof HttpException) {
      const resp = exception.getResponse();
      if (typeof resp === 'string') {
        message = resp;
      } else if (
        typeof resp === 'object' &&
        resp &&
        'message' in resp &&
        typeof (resp as any).message === 'string'
      ) {
        message = (resp as any).message;
      }
    } else if (exception instanceof Error && exception.message) {
      if (exception.message.toLowerCase().includes('failed to fetch user profile')) {
        message = 'Failed to retrieve profile from provider.';
      }
    }

    return response.redirect(
      `${baseUrl}/signin?error=${encodeURIComponent(message)}`,
    );
  }
}
