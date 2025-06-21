import { NestFactory } from '@nestjs/core';
import { configureApp, logStartupInfo, config } from '~/common';
import { AppModule } from './app.module';
import { MetricsInterceptor } from '~/common/interceptors/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      config.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Configure app with shared configuration
  configureApp(
    app,
    {
      title: 'Thmanyah CMS API',
      description: 'Internal API for managing media content',
      version: '1.0',
      tag: 'programs',
      tagDescription: 'Program management endpoints',
      serverUrl: 'http://localhost:3001',
      serverDescription: 'Development server',
      port: config.CMS_API_PORT,
      corsOrigins: [
        'http://localhost:3000', // Frontend development
        'http://localhost:3001', // CMS API itself
        'http://localhost:3002', // Discovery API
      ],
    },
    [new MetricsInterceptor()],
  );

  await app.listen(config.CMS_API_PORT);

  logStartupInfo({
    title: 'Thmanyah CMS API',
    description: 'Internal API for managing media content',
    version: '1.0',
    tag: 'programs',
    tagDescription: 'Program management endpoints',
    serverUrl: 'http://localhost:3001',
    serverDescription: 'Development server',
    port: config.CMS_API_PORT,
  });
}

void bootstrap();
