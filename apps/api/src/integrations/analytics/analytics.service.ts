import { Injectable } from '@nestjs/common';
import type { IntegrationStatus } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import type { Integration } from '../integration';

/**
 * PLACEHOLDER — PostHog product analytics (server-side events).
 * TODO: add `posthog-node`; flush on shutdown / end of Lambda invocation.
 * Events must never contain PII (no names, phones, case details) — use opaque ids only.
 */
@Injectable()
export class AnalyticsService implements Integration {
  constructor(private readonly config: AppConfig) {}

  status(): IntegrationStatus {
    return { name: 'analytics', provider: 'PostHog', configured: Boolean(this.config.get('POSTHOG_API_KEY')), phase: 'mvp' };
  }

  capture(_event: string, _distinctId: string, _properties?: Record<string, string | number | boolean>): void {
    // TODO: posthog.capture({ event, distinctId, properties })
  }
}
