import { Injectable } from '@nestjs/common';
import type { IntegrationStatus } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import { notConfigured, type Integration } from '../integration';

/**
 * PLACEHOLDER — 100ms video/voice (Phase 3). Calls happen in-app; phone numbers are never exposed.
 * TODO: create a room per consultation (management token signed with HMS_ACCESS_KEY/HMS_SECRET),
 * issue short-lived auth tokens per participant + role, store in `callSessions`.
 * Recording stays OFF unless both parties explicitly consent (docs/compliance.md).
 */
@Injectable()
export class VideoService implements Integration {
  constructor(private readonly config: AppConfig) {}

  status(): IntegrationStatus {
    return {
      name: 'video',
      provider: '100ms',
      configured: Boolean(this.config.get('HMS_ACCESS_KEY') && this.config.get('HMS_SECRET')),
      phase: 'phase3',
    };
  }

  async createRoom(_consultationId: string): Promise<{ roomId: string }> {
    notConfigured('video');
  }

  async createParticipantToken(_roomId: string, _userId: string, _role: 'citizen' | 'lawyer'): Promise<string> {
    notConfigured('video');
  }
}
