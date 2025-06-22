import { NestFactory } from '@nestjs/core';
import { configureApp, logStartupInfo, config } from '~/common';
import { AppModule } from './app.module';
import { MetricsInterceptor } from '~/common/interceptors/metrics.interceptor';

// --- Migration imports ---
import { DataSource } from 'typeorm';
import { Program, Outbox } from '@thmanyah/database';

async function runMigrationsIfNeeded() {
  // Only run if AUTO_MIGRATE is set or in production
  if (process.env.AUTO_MIGRATE === 'true' || config.NODE_ENV === 'production') {
    const dataSource = new DataSource({
      type: 'postgres',
      host: config.DATABASE_HOST,
      port: config.DATABASE_PORT,
      username: config.DATABASE_USERNAME,
      password: config.DATABASE_PASSWORD,
      database: config.DATABASE_NAME,
      entities: [Program, Outbox],
      migrations: ['node_modules/@thmanyah/database/dist/migrations/*.js'],
      migrationsRun: false,
      synchronize: false,
      logging: true,
      ssl:
        config.NODE_ENV === 'production' && !process.env.DATABASE_SSL_DISABLED
          ? { rejectUnauthorized: false }
          : false,
    });
    await dataSource.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();
    console.log('✅ Database migrations complete');
  }
}

async function bootstrap() {
  await runMigrationsIfNeeded();

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
      serverUrl: config.CMS_API_SERVER_URL,
      serverDescription: config.CMS_API_SERVER_DESCRIPTION,
      port: config.CMS_API_PORT,
      corsOrigins: config.CORS_ORIGINS.split(','),
      allowedHeaders: config.CORS_ALLOWED_HEADERS.split(','),
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
