// rebuild trigger
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import helmet from 'helmet';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap(): Promise<void> {
  // Create the Express adapter manually so we can register CORS middleware
  // BEFORE NestJS's init() adds routes and the 404 catch-all.
  const adapter = new ExpressAdapter();
  const expressApp = adapter.getInstance();

  // --- CORS: registered first, guaranteed to run before anything else ---
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    // Reflect whatever headers the browser asks for (most permissive)
    const requestedHeaders = req.headers['access-control-request-headers'];
    res.setHeader(
      'Access-Control-Allow-Headers',
      requestedHeaders || '*',
    );
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    next();
  });

  const app = await NestFactory.create(AppModule, adapter, {
    bufferLogs: true,
    rawBody: true, // Required for Stripe webhook signature verification
  });

  const config = app.get(AppConfigService);
  const logger = new Logger('Bootstrap');

  logger.log('CORS: pre-init Express middleware registered — v4');
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
