import { z } from 'zod';

const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined));
const bool = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => v === 'true');

/** Validated at boot — the API refuses to start with invalid config. */
export const EnvSchema = z
  .object({
    STAGE: z.enum(['local', 'test', 'dev', 'prod']).default('local'),
    PORT: z.coerce.number().int().positive().default(3000),
    APP_VERSION: z.string().default('0.0.0'),
    LOG_LEVEL: z.enum(['error', 'warn', 'log', 'debug', 'verbose']).default('log'),
    SWAGGER_ENABLED: bool,
    CORS_ORIGINS: z
      .string()
      .default('')
      .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),

    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    MONGODB_MAX_POOL_SIZE: z.coerce.number().int().min(1).max(50).default(5),

    ORIGIN_VERIFY_SECRET: optional,

    BETTER_AUTH_SECRET: optional,
    BETTER_AUTH_URL: optional,
    GOOGLE_CLIENT_ID: optional,
    GOOGLE_CLIENT_SECRET: optional,
    ALLOW_DEV_AUTH: bool,

    R2_ACCOUNT_ID: optional,
    R2_ACCESS_KEY_ID: optional,
    R2_SECRET_ACCESS_KEY: optional,
    R2_PRIVATE_BUCKET: optional,
    R2_PUBLIC_BUCKET: optional,
    CONTENT_CDN_URL: optional,

    AWS_REGION: z.string().default('ap-south-1'),
    JOBS_QUEUE_URL: optional,
    SES_FROM_EMAIL: optional,

    MSG91_AUTH_KEY: optional,
    MSG91_TEMPLATE_ID: optional,
    EXPO_ACCESS_TOKEN: optional,
    RAZORPAY_KEY_ID: optional,
    RAZORPAY_KEY_SECRET: optional,
    RAZORPAY_WEBHOOK_SECRET: optional,
    HMS_ACCESS_KEY: optional,
    HMS_SECRET: optional,
    HMS_TEMPLATE_ID: optional,
    BHASHINI_USER_ID: optional,
    BHASHINI_API_KEY: optional,
    MALWARE_SCAN_ENABLED: bool,
    SENTRY_DSN: optional,
    POSTHOG_API_KEY: optional,
    POSTHOG_HOST: optional,
  })
  .superRefine((env, ctx) => {
    if (env.ALLOW_DEV_AUTH && !['local', 'test'].includes(env.STAGE)) {
      ctx.addIssue({ code: 'custom', path: ['ALLOW_DEV_AUTH'], message: 'Dev auth is only allowed when STAGE=local|test' });
    }
    if (env.STAGE === 'prod' && !env.ORIGIN_VERIFY_SECRET) {
      ctx.addIssue({ code: 'custom', path: ['ORIGIN_VERIFY_SECRET'], message: 'Required in prod' });
    }
  });

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
