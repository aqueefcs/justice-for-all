import { Injectable, Logger } from '@nestjs/common';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import type { IntegrationStatus } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import type { Integration } from '../integration';

/**
 * Amazon SES (ap-south-1). Needs a verified domain + production access (leave sandbox).
 * Not configured → emails are skipped with a log line (no recipient/PII logged).
 */
@Injectable()
export class EmailService implements Integration {
  private readonly logger = new Logger(EmailService.name);
  private readonly client?: SESv2Client;
  private readonly from?: string;

  constructor(config: AppConfig) {
    this.from = config.get('SES_FROM_EMAIL');
    if (this.from) this.client = new SESv2Client({ region: config.get('AWS_REGION') });
  }

  status(): IntegrationStatus {
    return { name: 'email', provider: 'Amazon SES', configured: Boolean(this.client), phase: 'phase2' };
  }

  async send(input: { to: string; subject: string; html: string; text: string; template: string }) {
    if (!this.client || !this.from) {
      this.logger.warn(`SES not configured — skipped email "${input.template}"`);
      return;
    }
    await this.client.send(
      new SendEmailCommand({
        FromEmailAddress: this.from,
        Destination: { ToAddresses: [input.to] },
        Content: {
          Simple: {
            Subject: { Data: input.subject, Charset: 'UTF-8' },
            Body: { Html: { Data: input.html, Charset: 'UTF-8' }, Text: { Data: input.text, Charset: 'UTF-8' } },
          },
        },
      }),
    );
  }
}
