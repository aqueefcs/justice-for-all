import { z } from 'zod';

/**
 * Application roles. There is intentionally NO judge role (see ADR 0004).
 */
export const ROLES = ['citizen', 'lawyer', 'reviewer', 'admin', 'super_admin'] as const;
export const RoleSchema = z.enum(ROLES);
export type Role = z.infer<typeof RoleSchema>;

/** Roles that may author content in the CMS. */
export const CONTENT_AUTHOR_ROLES: readonly Role[] = ['lawyer', 'reviewer', 'admin', 'super_admin'];
/** Roles that may approve and publish content. */
export const CONTENT_PUBLISHER_ROLES: readonly Role[] = ['reviewer', 'admin', 'super_admin'];
/** Staff roles (must use 2FA). */
export const STAFF_ROLES: readonly Role[] = ['reviewer', 'admin', 'super_admin'];
export const ADMIN_ROLES: readonly Role[] = ['admin', 'super_admin'];

export function hasAnyRole(role: Role | undefined, allowed: readonly Role[]): boolean {
  return role !== undefined && allowed.includes(role);
}
