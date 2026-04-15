import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true, // Required for Stripe webhook signature verification
    cors: {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      // Omit allowedHeaders → cors package reflects Access-Control-Request-Headers
      // from the preflight, which permits every header the browser asks for.
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 86400, // cache preflight for 24 h
    },
  });

  const config = app.get(AppConfigService);
  const logger = new Logger('Bootstrap');

  logger.log('CORS: wildcard enabled via NestFactory — v3');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false, // default require-corp breaks cross-origin
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.setGlobalPrefix('api', { exclude: [] });

  const port = config.get('PORT');
  await app.listen(port, '0.0.0.0');
  logger.log(`Picflow API listening on :${port} (${config.get('NODE_ENV')})`);
}

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
