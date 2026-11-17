import type { FastifyRequest } from 'fastify';
import type { Role } from '@jfa/shared';

export interface RequestUser {
  id: string;
  role: Role;
  /** Staff must have TOTP two-factor enabled to use staff routes. */
  twoFactorEnabled: boolean;
  /** True when resolved from the test-only `x-dev-role` header. */
  isDev?: boolean;
}

export type AppRequest = FastifyRequest & { user?: RequestUser };
