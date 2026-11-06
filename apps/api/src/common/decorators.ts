import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { Role } from '@jfa/shared';
import type { AppRequest, RequestUser } from './auth.types';

export const IS_PUBLIC_KEY = 'isPublic';
/** Routes are private by default (default-deny). Mark genuinely public routes with @Public(). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
/** Restrict a route to these roles (checked by RolesGuard after AuthGuard). */
export const Roles = (...roles: readonly Role[]) => SetMetadata(ROLES_KEY, roles);

/** Injects the authenticated user. Only use on non-public routes. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestUser | undefined =>
    ctx.switchToHttp().getRequest<AppRequest>().user,
);
