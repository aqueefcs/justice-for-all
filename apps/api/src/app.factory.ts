import 'reflect-metadata';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { applyMongooseSafety } from '@jfa/db';
import { ERROR_CODES, hasUnsafeMongoKeys } from '@jfa/shared';
import { AppModule } from './app.module';
import { AppConfig } from './config/app-config.service';

export const API_PREFIX = 'v1';

export async function createApp(): Promise<NestFastifyApplication> {
  applyMongooseSafety();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true, bodyLimit: 1_048_576 }),
    { logger: loggerLevels(process.env.LOG_LEVEL) },
  );
  const config = app.get(AppConfig);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: config.get('CORS_ORIGINS'),
    credentials: true,
  });

  // Reject NoSQL operator injection ($-keys / dotted keys) before anything else sees the payload.
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('preValidation', async (request, reply) => {
      if (hasUnsafeMongoKeys(request.body) || hasUnsafeMongoKeys(request.query)) {
        return reply.status(400).send({ code: ERROR_CODES.VALIDATION_FAILED, message: 'Invalid keys in request' });
      }
    });

  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();

  if (config.get('SWAGGER_ENABLED')) {
    SwaggerModule.setup('docs', app, buildOpenApi(app));
  }
  return app;
}

const LEVELS = ['error', 'warn', 'log', 'debug', 'verbose'] as const;
type Level = (typeof LEVELS)[number];

/** `LOG_LEVEL=log` → ['error','warn','log'] (each level includes the more severe ones). */
export function loggerLevels(level: string | undefined): Level[] {
  const index = LEVELS.indexOf((level ?? 'log') as Level);
  return LEVELS.slice(0, index === -1 ? 3 : index + 1);
}

export function buildOpenApi(app: NestFastifyApplication): OpenAPIObject {
  const config = app.get(AppConfig);
  const doc = new DocumentBuilder()
    .setTitle('Justice For All API')
    .setDescription('REST API for the Justice For All app, admin console and website.')
    .setVersion(config.get('APP_VERSION'))
    .addCookieAuth('better-auth.session_token')
    .addBearerAuth()
    .build();
  return cleanupOpenApiDoc(SwaggerModule.createDocument(app, doc));
}
