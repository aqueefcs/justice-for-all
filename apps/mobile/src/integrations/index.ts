/**
 * Mobile integration placeholders. Each is a safe no-op until wired up.
 * See docs/integrations.md for the full list, env vars and the phase each one lands in.
 */
import { env } from '../lib/env';

/**
 * Sentry — crash & error reporting.
 * TODO: `npx expo install @sentry/react-native`, add its config plugin, call
 * Sentry.init({ dsn: env.sentryDsn, sendDefaultPii: false, beforeSend: scrubPii }) and wrap the root layout.
 */
export function initErrorTracking() {
  if (!env.sentryDsn) return;
}

export function captureError(_error: unknown) {
  // TODO: Sentry.captureException(error)
}

/**
 * PostHog — privacy-friendly product analytics.
 * TODO: `npx expo install posthog-react-native`; anonymous ids only; events must never contain
 * personal data or what the user typed (case details, names, phone numbers).
 */
export function initAnalytics() {
  if (!env.posthogKey) return;
}

export function track(_event: string, _props?: Record<string, string | number | boolean>) {
  // TODO: posthog.capture(event, props)
}
