import { Injectable } from '@nestjs/common';
import type { IntegrationStatus } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import { notConfigured, type Integration } from '../integration';

/**
 * PLACEHOLDER — MSG91 SMS OTP (Phase 2).
 * TODO: TRAI DLT registration (entity + sender ID + OTP template), then call
 *   POST https://control.msg91.com/api/v5/otp  (authkey header, template_id, mobile)
 * Used by Better Auth's phoneNumber plugin `sendOTP` callback. Never log phone numbers or OTPs.
 */
@Injectable()
export class SmsService implements Integration {
  constructor(private readonly config: AppConfig) {}

  status(): IntegrationStatus {
    return {
      name: 'sms',
      provider: 'MSG91',
      configured: Boolean(this.config.get('MSG91_AUTH_KEY') && this.config.get('MSG91_TEMPLATE_ID')),
      phase: 'phase2',
    };
  }

  async sendOtp(_phoneE164: string, _code: string): Promise<void> {
    notConfigured('sms');
  }
}
