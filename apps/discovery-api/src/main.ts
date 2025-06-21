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
    serverUrl: 'http://localhost:3002',
    serverDescription: 'Development server',
    port: config.DISCOVERY_API_PORT,
    corsOrigins: [
      'http://localhost:3000', // Frontend development
      'http://localhost:3001', // CMS API
      'http://localhost:3002', // Discovery API itself
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-request-id',
      'x-api-version',
    ],
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
