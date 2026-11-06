import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODES, hasAnyRole, type Role } from '@jfa/shared';
import type { AppRequest } from '../auth.types';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const roles = this.reflector.getAllAndOverride<readonly Role[] | undefined>(ROLES_KEY, targets);
    if (!roles || roles.length === 0) return true; // authenticated is enough

    const { user } = context.switchToHttp().getRequest<AppRequest>();
    if (hasAnyRole(user?.role, roles)) return true;
    throw new ForbiddenException({ code: ERROR_CODES.FORBIDDEN, message: 'Not allowed for your role' });
  }
}
