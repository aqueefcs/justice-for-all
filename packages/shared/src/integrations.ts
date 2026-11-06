import { z } from 'zod';

/**
 * Every third-party tool the platform integrates with. Each one has a placeholder
 * provider in the API (`apps/api/src/integrations/*`) that is swapped for the real
 * one once its env vars are set. See docs/integrations.md.
 */
export const INTEGRATIONS = [
  'auth', // Better Auth (sessions, phone OTP, Google, 2FA)
  'storage', // Cloudflare R2 (S3 API) — files & content packs
  'queue', // AWS SQS — background jobs
  'email', // Amazon SES
  'sms', // MSG91 — OTP
  'push', // Expo Push (FCM)
  'payments', // Razorpay (UPI)
  'video', // 100ms — consultation calls
  'translation', // Bhashini / IndicTrans2 — machine draft translations
  'malwareScan', // ClamAV (worker Lambda)
  'errorTracking', // Sentry
  'analytics', // PostHog
] as const;
export const IntegrationNameSchema = z.enum(INTEGRATIONS);
export type IntegrationName = z.infer<typeof IntegrationNameSchema>;

export const IntegrationPhaseSchema = z.enum(['mvp', 'phase2', 'phase3', 'phase4']);

export const IntegrationStatusSchema = z.object({
  name: IntegrationNameSchema,
  provider: z.string(),
  configured: z.boolean(),
  phase: IntegrationPhaseSchema,
});
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;

export const HealthSchema = z.object({
  status: z.literal('ok'),
  version: z.string(),
  stage: z.string(),
  time: z.string(),
});
export type Health = z.infer<typeof HealthSchema>;
