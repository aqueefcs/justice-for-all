import type { Connection } from 'mongoose';
import { ROLES } from '@jfa/shared';

/**
 * Better Auth (ADR 0007): email + password with TOTP two-factor for staff, roles via the admin
 * plugin, data in our MongoDB through the official adapter.
 *
 * Better Auth is ESM-only while the API compiles to CommonJS, so it is loaded with dynamic
 * `import()` inside this async factory (works the same in Node, Vitest and the Lambda bundle).
 */
export const AUTH_INSTANCE = Symbol('AUTH_INSTANCE');

/** Roles only a super_admin may grant. */
const PRIVILEGED_ROLES = new Set(['admin', 'super_admin']);

export interface AuthOptions {
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
  /** Local/test: plain-http cookies, no rate limiting in tests. */
  isLocal: boolean;
  isTest: boolean;
  connection: Connection;
}

export async function createAuth(opts: AuthOptions) {
  const { betterAuth } = await import('better-auth');
  const { mongodbAdapter } = await import('better-auth/adapters/mongodb');
  const { admin, twoFactor } = await import('better-auth/plugins');
  const { createAccessControl } = await import('better-auth/plugins/access');
  const { defaultStatements, adminAc, userAc } = await import('better-auth/plugins/admin/access');
  const { APIError, createAuthMiddleware, getSessionFromCtx } = await import('better-auth/api');

  // Custom role names must be declared to the admin plugin. Only admin/super_admin may manage
  // users; content permissions are enforced by our own RolesGuard (RBAC on the API routes).
  const ac = createAccessControl(defaultStatements);
  const roles = {
    citizen: userAc,
    lawyer: userAc,
    reviewer: userAc,
    admin: adminAc,
    super_admin: adminAc,
  } satisfies Record<(typeof ROLES)[number], unknown>;

  const client = opts.connection.getClient();
  const db = opts.connection.db;
  if (!db) throw new Error('MongoDB connection is not open — cannot start Better Auth');
  const audit = async (action: string, entityId: string, meta: Record<string, string | boolean | null>) => {
    try {
      // Looked up at call time: the AuditLog model is registered by AuditModule, possibly after auth starts.
      await opts.connection.models.AuditLog?.create({ action, entity: 'user', entityId, meta });
    } catch {
      // audit failures must never block authentication
    }
  };

  return betterAuth({
    appName: 'Justice For All',
    secret: opts.secret,
    baseURL: opts.baseURL,
    basePath: '/v1/auth',
    trustedOrigins: opts.trustedOrigins,
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // staff accounts are created by admins (Team page / create-admin script)
      minPasswordLength: 12,
    },
    plugins: [
      twoFactor({ issuer: 'Justice For All' }),
      admin({ ac, roles, defaultRole: 'citizen', adminRoles: ['admin', 'super_admin'] }),
    ],
    rateLimit: { enabled: !opts.isTest },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (!ctx.path.startsWith('/admin/')) return;
        const session = await getSessionFromCtx(ctx);
        const actor = session?.user as { role?: string; twoFactorEnabled?: boolean | null } | undefined;
        // Same rule as the API guard: staff must use two-step verification to manage users.
        if (actor && !actor.twoFactorEnabled) {
          throw new APIError('FORBIDDEN', { message: 'Set up two-step verification to continue', code: 'TWO_FACTOR_REQUIRED' });
        }
        // Privilege escalation guard: only a super_admin may grant admin or super_admin.
        if (ctx.path !== '/admin/create-user' && ctx.path !== '/admin/set-role') return;
        const requested = ([] as unknown[])
          .concat((ctx.body as { role?: unknown } | undefined)?.role ?? [])
          .flatMap((r) => String(r).split(','));
        if (!requested.some((r) => PRIVILEGED_ROLES.has(r.trim()))) return;
        if (!String(actor?.role ?? '').split(',').includes('super_admin')) {
          throw new APIError('FORBIDDEN', { message: 'Only a super admin can grant admin roles' });
        }
      }),
    },
    advanced: {
      cookiePrefix: 'jfa',
      useSecureCookies: !opts.isLocal,
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await audit('user.create', user.id, { role: (user as { role?: string }).role ?? null });
          },
        },
        update: {
          after: async (user) => {
            const u = user as { role?: string; banned?: boolean };
            await audit('user.update', user.id, { role: u.role ?? null, banned: u.banned ?? false });
          },
        },
      },
    },
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;
