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

  console.log('📤 Outbox Publisher started successfully');
  console.log('⏰ Running every 5 seconds to process outbox events...');

  // Keep the application running
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down Outbox Publisher...');
    void app.close().then(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down Outbox Publisher...');
    void app.close().then(() => process.exit(0));
  });
}

void bootstrap();
