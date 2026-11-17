import type { Role } from '@jfa/shared';
import type { Auth } from './better-auth';

export interface NewStaffUser {
  email: string;
  name: string;
  role: Role;
  password: string;
}

/**
 * Creates a user with an email/password credential directly through Better Auth's internal
 * adapter. Used for the very first super_admin (scripts/create-admin.mjs) and in tests —
 * everyone else is created by an admin from the admin console (admin plugin `createUser`).
 */
export async function createStaffUser(auth: Auth, input: NewStaffUser): Promise<{ id: string }> {
  const ctx = await auth.$context;
  const email = input.email.trim().toLowerCase();
  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) throw new Error(`A user with email ${email} already exists`);

  const user = await ctx.internalAdapter.createUser(
    { email, name: input.name, emailVerified: true, role: input.role },
    { method: 'admin' },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: 'credential',
    accountId: user.id,
    password: await ctx.password.hash(input.password),
  });
  return { id: user.id };
}
