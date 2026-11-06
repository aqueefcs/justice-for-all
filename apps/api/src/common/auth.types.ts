import type { FastifyRequest } from 'fastify';
import type { Role } from '@jfa/shared';

export interface RequestUser {
  id: string;
  role: Role;
  /** True when resolved from the local-only `x-dev-role` header. */
  isDev?: boolean;
}

export type AppRequest = FastifyRequest & { user?: RequestUser };
