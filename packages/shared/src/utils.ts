/**
 * Returns true if any key at any depth starts with `$` or contains `.`
 * — used to reject NoSQL operator injection payloads before they reach MongoDB.
 */
export function hasUnsafeMongoKeys(value: unknown, depth = 0): boolean {
  if (depth > 20 || value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some((v) => hasUnsafeMongoKeys(v, depth + 1));
  for (const [key, v] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) return true;
    if (hasUnsafeMongoKeys(v, depth + 1)) return true;
  }
  return false;
}

/** Replaces {{key}} placeholders with HTML-escaped values. Unknown keys become empty strings. */
export function fillTemplate(bodyHtml: string, values: Record<string, string | undefined>): string {
  return bodyHtml.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g, (_, key: string) =>
    escapeHtml(values[key] ?? ''),
  );
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>');
}

/** Stable error codes returned by the API (`{ code }`). */
export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INVALID_TRANSITION: 'INVALID_TRANSITION',
  INTEGRATION_NOT_CONFIGURED: 'INTEGRATION_NOT_CONFIGURED',
  INTERNAL: 'INTERNAL',
} as const;
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
