/**
 * PLACEHOLDERS for later phases — present so screens and navigation can reference them now.
 *
 * Push notifications (Phase 2) — Expo Push via `expo-notifications`:
 *   TODO: request permission after a meaningful action (not on first launch), register the Expo
 *   push token with the API, Android notification channel for booking reminders.
 *
 * Payments (Phase 3) — Razorpay UPI checkout:
 *   TODO: `react-native-razorpay` (needs a dev build), open checkout with the order id created by
 *   the API; the payment is confirmed only by the server-side webhook, never by the client.
 *
 * Video/voice calls (Phase 3) — 100ms:
 *   TODO: `@100mslive/react-native-hms`; join with a short-lived token from the API.
 *   Recording OFF unless both parties consent.
 *
 * Documents (Phase 2) — uploads to private R2 via presigned URLs:
 *   TODO: `expo-document-picker` + `expo-image-picker`; request a presigned PUT from the API,
 *   upload directly, then poll until the malware scan marks the file `clean`.
 */
export const FUTURE_FEATURES = ['consult', 'documents', 'profile', 'lawyer'] as const;
export type FutureFeature = (typeof FUTURE_FEATURES)[number];

export function isFutureFeature(value: unknown): value is FutureFeature {
  return typeof value === 'string' && (FUTURE_FEATURES as readonly string[]).includes(value);
}
