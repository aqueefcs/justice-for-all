import { Injectable, Logger } from '@nestjs/common';
import type { IntegrationStatus } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import type { Integration } from '../integration';

/**
 * PLACEHOLDER — Sentry error tracking.
 * TODO: add `@sentry/nestjs`, call `Sentry.init({ dsn, environment: STAGE, sendDefaultPii: false,
 * beforeSend: scrubPii })` in an `instrument.ts` imported first in main.ts and worker.ts.
 */
@Injectable()
export class ErrorTrackingService implements Integration {
  private readonly logger = new Logger(ErrorTrackingService.name);

  constructor(private readonly config: AppConfig) {}

  status(): IntegrationStatus {
    return { name: 'errorTracking', provider: 'Sentry', configured: Boolean(this.config.get('SENTRY_DSN')), phase: 'mvp' };
  }

  captureException(error: unknown): void {
    if (!this.config.get('SENTRY_DSN')) return;
    // TODO: Sentry.captureException(error)
    this.logger.debug(`(sentry placeholder) ${error instanceof Error ? error.name : 'error'}`);
  }
}
