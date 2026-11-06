import { Injectable, Logger } from '@nestjs/common';
import type { IntegrationStatus } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import type { Integration } from '../integration';

/**
 * PLACEHOLDER — Expo Push Notifications (Phase 2/3: booking reminders, draft-ready alerts).
 * TODO: add `expo-server-sdk`, store device push tokens per user, send in chunks from a worker job,
 * and handle receipts (remove DeviceNotRegistered tokens). Keep notification text free of case details.
 */
@Injectable()
export class PushService implements Integration {
  private readonly logger = new Logger(PushService.name);

  constructor(private readonly config: AppConfig) {}

  status(): IntegrationStatus {
    return { name: 'push', provider: 'Expo Push', configured: Boolean(this.config.get('EXPO_ACCESS_TOKEN')), phase: 'phase2' };
  }

  async send(_tokens: string[], message: { titleKey: string }): Promise<void> {
    this.logger.warn(`Push not configured — skipped "${message.titleKey}"`);
  }
}
