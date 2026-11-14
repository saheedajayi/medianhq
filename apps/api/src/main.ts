import * as dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Preload environment files before Nest boots
for (const envPath of [
  resolve(process.cwd(), 'apps/api/.env.local'),
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), 'apps/api/.env'),
  resolve(process.cwd(), '.env'),
]) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
}

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { ApiResponseInterceptor } from './common/api-response.interceptor';

function getAllowedOrigins() {
  const origins = process.env.WEB_ORIGINS ?? process.env.WEB_ORIGIN;

  if (!origins) {
    throw new Error(
      'Environment variable WEB_ORIGINS or WEB_ORIGIN must be defined.',
    );
  }

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  // rawBody keeps the exact request bytes, which the Paystack and LiveKit webhook signatures are computed over
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  // LiveKit posts its webhooks as application/webhook+json
  app.useBodyParser('json', {
    type: ['application/json', 'application/webhook+json'],
  });
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.setGlobalPrefix('api', {
    exclude: ['', '/', 'health'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
  });
  app.useGlobalFilters(new ApiExceptionFilter(httpAdapterHost));
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  await app.listen(process.env.PORT ?? process.env.API_PORT ?? 4000);
}
void bootstrap();
