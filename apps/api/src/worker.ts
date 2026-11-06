import 'reflect-metadata';
import type { INestApplicationContext } from '@nestjs/common';
import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { loadSsmParameters } from './config/load-ssm';

/**
 * AWS Lambda handler for the SQS "jobs" queue (see infra JobsStack).
 * The Nest context is created once per execution environment and reused.
 * Failed messages are reported individually so SQS retries only those (then DLQ).
 */
let context: Promise<INestApplicationContext> | undefined;

async function createContext(): Promise<INestApplicationContext> {
  await loadSsmParameters();
  // Imported after SSM so ConfigModule validates the final environment.
  const { NestFactory } = await import('@nestjs/core');
  const { applyMongooseSafety } = await import('@jfa/db');
  const { AppModule } = await import('./app.module.js');
  applyMongooseSafety();
  return NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
}

export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  context ??= createContext();
  const { JobsService } = await import('./jobs/jobs.module.js');
  const jobs = (await context).get(JobsService);
  const batchItemFailures: SQSBatchResponse['batchItemFailures'] = [];
  for (const record of event.Records) {
    try {
      await jobs.handle(JSON.parse(record.body));
    } catch (err) {
      console.error(`Job failed (messageId=${record.messageId}):`, (err as Error).message);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures };
}
