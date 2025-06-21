import { NestFactory } from '@nestjs/core';
import { config } from '@thmanyah/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger:
      config.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  console.log('🔄 Sync Worker started successfully');
  console.log('📦 Processing outbox events...');

  // Keep the application running
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down Sync Worker...');
    void app.close().then(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down Sync Worker...');
    void app.close().then(() => process.exit(0));
  });
}

void bootstrap();
