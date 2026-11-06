import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './schema';

export type { paths, components } from './schema';

export interface ApiClientOptions {
  baseUrl: string;
  /** Returns a bearer token (mobile, from expo-secure-store). Web uses httpOnly cookies instead. */
  getToken?: () => Promise<string | undefined> | string | undefined;
  /** LOCAL DEVELOPMENT ONLY: impersonate a role via `x-dev-role` (ignored by the API outside local). */
  devRole?: () => string | undefined;
  /** Send cookies (admin web). */
  withCredentials?: boolean;
}

/**
 * Typed client for the Justice For All API.
 * @example const api = createApiClient({ baseUrl }); const { data } = await api.GET('/v1/health');
 */
export function createApiClient(options: ApiClientOptions) {
  const client = createClient<paths>({
    baseUrl: options.baseUrl.replace(/\/$/, ''),
    credentials: options.withCredentials ? 'include' : 'same-origin',
  });

  const auth: Middleware = {
    async onRequest({ request }) {
      const token = await options.getToken?.();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
      const role = options.devRole?.();
      if (role) request.headers.set('x-dev-role', role);
      return request;
    },
  };
  client.use(auth);
  return client;
}

export type ApiClient = ReturnType<typeof createApiClient>;
