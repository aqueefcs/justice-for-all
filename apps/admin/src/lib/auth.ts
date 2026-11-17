import { createAuthClient } from 'better-auth/react';
import { adminClient, twoFactorClient } from 'better-auth/client/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements, userAc } from 'better-auth/plugins/admin/access';
import { hasAnyRole, RoleSchema, type Role } from '@jfa/shared';
import { env } from './env';

/** Mirrors the server's role definitions (apps/api/src/auth/better-auth.ts). */
const ac = createAccessControl(defaultStatements);
const roles = { citizen: userAc, lawyer: userAc, reviewer: userAc, admin: adminAc, super_admin: adminAc };

export const authClient = createAuthClient({
  baseURL: env.apiUrl,
  basePath: '/v1/auth',
  fetchOptions: { credentials: 'include' },
  plugins: [twoFactorClient(), adminClient({ ac, roles })],
});

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  twoFactorEnabled: boolean;
};

/** Normalises the Better Auth session user (role may be comma-separated). */
export function toSessionUser(user: Record<string, unknown> | undefined | null): SessionUser | undefined {
  if (!user) return undefined;
  const first = String(user.role ?? '')
    .split(',')
    .map((r) => r.trim())
    .find((r) => RoleSchema.safeParse(r).success);
  return {
    id: String(user.id),
    name: String(user.name ?? ''),
    email: String(user.email ?? ''),
    role: (first as Role | undefined) ?? 'citizen',
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
  };
}

export function useCurrentUser() {
  const session = authClient.useSession();
  return { ...session, user: toSessionUser(session.data?.user as Record<string, unknown> | undefined) };
}

export const can = {
  publish: (u?: SessionUser) => hasAnyRole(u?.role, ['reviewer', 'admin', 'super_admin']),
  manageTeam: (u?: SessionUser) => hasAnyRole(u?.role, ['admin', 'super_admin']),
  /** Only super admins may create other admins. */
  assignableRoles: (u?: SessionUser): Role[] =>
    u?.role === 'super_admin' ? ['lawyer', 'reviewer', 'admin', 'super_admin'] : ['lawyer', 'reviewer'],
};
