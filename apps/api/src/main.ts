import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function getAllowedOrigins() {
  const origins = process.env.WEB_ORIGINS ?? process.env.WEB_ORIGIN;

  return (origins ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? process.env.API_PORT ?? 4000);
}
void bootstrap();
