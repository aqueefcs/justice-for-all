import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODES } from '@jfa/shared';
import { AuthService } from '../../auth/auth.service';
import type { AppRequest } from '../auth.types';
import { IS_PUBLIC_KEY } from '../decorators';

/** Default-deny: every route needs an authenticated user unless marked @Public(). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AppRequest>();
    const user = await this.auth.resolveUser(request);
    if (!user) {
      throw new UnauthorizedException({ code: ERROR_CODES.UNAUTHENTICATED, message: 'Sign in required' });
    }
    request.user = user;
    return true;
  }
}
