import { Logger } from '@nestjs/common';
import { loadSsmParameters } from './config/load-ssm';

/**
 * Entry point for local dev, containers (Fargate) and AWS Lambda.
 * On Lambda the Lambda Web Adapter starts this server and proxies invocations to PORT (8080).
 */
async function bootstrap() {
  await loadSsmParameters();
  // Loaded after SSM so ConfigModule validates the final environment.
  const { createApp } = await import('./app.factory.js');
  const { AppConfig } = await import('./config/app-config.service.js');
  const app = await createApp();
  const config = app.get(AppConfig);
  const port = config.get('PORT');
  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on :${port} (stage=${config.get('STAGE')})`, 'Bootstrap');
  if (config.get('SWAGGER_ENABLED')) Logger.log(`Swagger: http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();
