import { env } from '../lib/env';

/**
 * API access. In the MVP citizens never call the API — content comes from packs (ADR 0003).
 * TODO(Phase 2): add `@jfa/api-client` and create the typed client:
 *   createApiClient({ baseUrl: env.apiUrl!, getToken: getSessionToken })
 * and use it with TanStack Query hooks.
 */
export const apiConfigured = Boolean(env.apiUrl);
