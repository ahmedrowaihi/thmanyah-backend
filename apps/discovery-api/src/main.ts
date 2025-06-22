import { NestFactory } from '@nestjs/core';
import { configureApp, logStartupInfo, config } from '~/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      config.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Configure app with shared configuration
  configureApp(app, {
    title: 'Thmanyah Discovery API',
    description: 'Public API for searching and discovering media content',
    version: '1.0',
    tag: 'search',
    tagDescription: 'Search and discovery endpoints',
    serverUrl: config.DISCOVERY_API_SERVER_URL,
    serverDescription: config.DISCOVERY_API_SERVER_DESCRIPTION,
    port: config.DISCOVERY_API_PORT,
    corsOrigins: config.CORS_ORIGINS.split(','),
    allowedHeaders: config.CORS_ALLOWED_HEADERS.split(','),
  });

  await app.listen(config.DISCOVERY_API_PORT);

  logStartupInfo({
    title: 'Thmanyah Discovery API',
    description: 'Public API for searching and discovering media content',
    version: '1.0',
    tag: 'search',
    tagDescription: 'Search and discovery endpoints',
    serverUrl: 'http://localhost:3002',
    serverDescription: 'Development server',
    port: config.DISCOVERY_API_PORT,
  });
}

void bootstrap();
