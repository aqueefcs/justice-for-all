import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { IntegrationStatus } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import { notConfigured, type Integration } from '../integration';

/**
 * PLACEHOLDER — Razorpay (Phase 3). UPI-first checkout; Razorpay Route for lawyer payouts.
 * TODO:
 *  - `createOrder`: POST /v1/orders (amount in paise, receipt = consultationId) — add the `razorpay` SDK
 *  - webhook endpoint: verify signature (below), dedupe with idempotencyKeys, update
 *    consultation + payment inside a MongoDB transaction
 *  - legal: fee split shown separately (lawyer fee vs platform fee) — see docs/compliance.md
 */
@Injectable()
export class PaymentsService implements Integration {
  constructor(private readonly config: AppConfig) {}

  status(): IntegrationStatus {
    return {
      name: 'payments',
      provider: 'Razorpay',
      configured: Boolean(this.config.get('RAZORPAY_KEY_ID') && this.config.get('RAZORPAY_KEY_SECRET')),
      phase: 'phase3',
    };
  }

  async createOrder(_input: { amountPaise: number; receipt: string }): Promise<{ orderId: string }> {
    notConfigured('payments');
  }

  /** Razorpay webhook signature: HMAC-SHA256(rawBody, webhookSecret) in `x-razorpay-signature`. */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = this.config.get('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) notConfigured('payments');
    const expected = Buffer.from(createHmac('sha256', secret).update(rawBody).digest('hex'));
    const provided = Buffer.from(signature);
    return expected.length === provided.length && timingSafeEqual(expected, provided);
  }
}
