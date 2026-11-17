import { Inject, Injectable } from '@nestjs/common';
import { RoleSchema, type Role } from '@jfa/shared';
import { AppConfig } from '../config/app-config.service';
import type { AppRequest, RequestUser } from '../common/auth.types';
import { AUTH_INSTANCE, type Auth } from './better-auth';

/** Converts Node/Fastify headers to web `Headers` for Better Auth. */
export function toWebHeaders(raw: AppRequest['headers']): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.set(key, String(value));
  }
  return headers;
}

/** Better Auth stores roles as a comma-separated string; take the first role we recognise. */
export function parseRole(raw: unknown): Role {
  const candidates = typeof raw === 'string' ? raw.split(',').map((r) => r.trim()) : [];
  for (const c of candidates) {
    const parsed = RoleSchema.safeParse(c);
    if (parsed.success) return parsed.data;
  }
  return 'citizen';
}

/**
 * Resolves the signed-in user from the Better Auth session cookie / bearer token.
 * In automated tests only (STAGE=test + ALLOW_DEV_AUTH), `x-dev-role` impersonates a role.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly config: AppConfig,
    @Inject(AUTH_INSTANCE) private readonly auth: Auth | undefined,
  ) {}

  get isConfigured(): boolean {
    return Boolean(this.auth && this.config.get('BETTER_AUTH_SECRET'));
  }

  async resolveUser(request: AppRequest): Promise<RequestUser | undefined> {
    if (this.config.get('STAGE') === 'test' && this.config.get('ALLOW_DEV_AUTH')) {
      const parsed = RoleSchema.safeParse(request.headers['x-dev-role']);
      if (parsed.success) {
        const devUser = request.headers['x-dev-user'];
        return {
          id: typeof devUser === 'string' && devUser ? devUser : `dev-${parsed.data}`,
          role: parsed.data,
          twoFactorEnabled: true,
          isDev: true,
        };
      }
    }
    if (!this.auth) return undefined;

    const session = await this.auth.api.getSession({ headers: toWebHeaders(request.headers) });
    if (!session) return undefined;
    const user = session.user as { id: string; role?: string; twoFactorEnabled?: boolean | null; banned?: boolean | null };
    if (user.banned) return undefined;
    return { id: user.id, role: parseRole(user.role), twoFactorEnabled: Boolean(user.twoFactorEnabled) };
  }
}
