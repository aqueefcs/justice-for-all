import { QueryClient } from '@tanstack/react-query';
import { createApiClient } from '@jfa/api-client';
import { env } from './env';

/** Typed client for fixed endpoints (health, review queue, publishing…). Cookies carry the session. */
export const api = createApiClient({ baseUrl: env.apiUrl, withCredentials: true });

/** Error with the API's stable `{ code, message }` shape. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

/** Small fetch helper for per-content-type endpoints (`/v1/content/<kind>/...`). */
export async function apiFetch<T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : undefined;
  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data?.code as string) ?? `HTTP_${res.status}`,
      (data?.message as string) ?? res.statusText,
      data?.details as ApiError['details'],
    );
  }
  return data as T;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
    },
  },
});
