import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { QueryClient } from '@tanstack/react-query';
import { createApiClient } from '@jfa/api-client';
import { resources } from '@jfa/i18n';
import { RoleSchema, type Role } from '@jfa/shared';

export const env = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000',
  stage: (import.meta.env.VITE_STAGE as string | undefined) ?? 'local',
};

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  ns: ['admin', 'common'],
  defaultNS: 'admin',
  interpolation: { escapeValue: false },
});

/**
 * PLACEHOLDER auth. TODO(Phase 1): Better Auth (email + password + 2FA for staff) using
 * httpOnly cookies — then delete the dev-role mechanism below.
 * The dev role only works against an API running with STAGE=local and ALLOW_DEV_AUTH=true.
 */
const DEV_ROLE_KEY = 'jfa.devRole';
export const devAuth = {
  get(): Role | undefined {
    try {
      const parsed = RoleSchema.safeParse(sessionStorage.getItem(DEV_ROLE_KEY));
      return parsed.success ? parsed.data : undefined;
    } catch {
      return undefined;
    }
  },
  set(role: Role) {
    try {
      sessionStorage.setItem(DEV_ROLE_KEY, role);
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(DEV_ROLE_KEY);
    } catch {
      /* ignore */
    }
  },
};

export const api = createApiClient({
  baseUrl: env.apiUrl,
  withCredentials: true,
  devRole: () => (env.stage === 'local' ? devAuth.get() : undefined),
});

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export { i18n };
