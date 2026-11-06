/** Public runtime config (EXPO_PUBLIC_* are inlined at build time — never secrets). */
const clean = (v: string | undefined) => (v && v.trim().length > 0 ? v.trim().replace(/\/$/, '') : undefined);

export const env = {
  stage: process.env.EXPO_PUBLIC_STAGE ?? 'local',
  apiUrl: clean(process.env.EXPO_PUBLIC_API_URL),
  contentCdnUrl: clean(process.env.EXPO_PUBLIC_CONTENT_CDN_URL),
  sentryDsn: clean(process.env.EXPO_PUBLIC_SENTRY_DSN),
  posthogKey: clean(process.env.EXPO_PUBLIC_POSTHOG_KEY),
  posthogHost: clean(process.env.EXPO_PUBLIC_POSTHOG_HOST),
} as const;
