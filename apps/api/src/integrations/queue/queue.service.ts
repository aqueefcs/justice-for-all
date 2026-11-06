import { Injectable } from '@nestjs/common';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { IntegrationStatus } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import type { Integration } from '../integration';

/** AWS SQS. When not configured, JobsService runs jobs inline (local dev). */
@Injectable()
export class QueueService implements Integration {
  private readonly client?: SQSClient;
  private readonly queueUrl?: string;

  constructor(config: AppConfig) {
    this.queueUrl = config.get('JOBS_QUEUE_URL');
    if (this.queueUrl) this.client = new SQSClient({ region: config.get('AWS_REGION') });
  }

  get isConfigured(): boolean {
    return Boolean(this.client && this.queueUrl);
  }

  status(): IntegrationStatus {
    return { name: 'queue', provider: 'AWS SQS', configured: this.isConfigured, phase: 'mvp' };
  }

  async send(body: unknown): Promise<void> {
    if (!this.client || !this.queueUrl) throw new Error('Queue not configured');
    await this.client.send(new SendMessageCommand({ QueueUrl: this.queueUrl, MessageBody: JSON.stringify(body) }));
  }
}
