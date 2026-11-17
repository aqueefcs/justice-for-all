import { timingSafeEqual } from 'node:crypto';
import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { ERROR_CODES } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import type { AppRequest } from '../auth.types';

/**
 * True when no secret is configured (local) or the `x-origin-verify` header matches it
 * (constant-time compare). Shared by the Nest guard and the raw Fastify auth routes.
 */
export function isOriginVerified(header: string | string[] | undefined, secret: string | undefined): boolean {
  if (!secret) return true;
  const provided = Buffer.from(typeof header === 'string' ? header : '');
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

/**
 * Locks the API to Cloudflare: Cloudflare adds `x-origin-verify: <secret>` via a Transform Rule,
 * so calling the raw Lambda Function URL directly is rejected. Disabled when no secret is set (local).
 */
@Injectable()
export class OriginVerifyGuard implements CanActivate {
  private readonly secret: string | undefined;

  constructor(config: AppConfig) {
    this.secret = config.get('ORIGIN_VERIFY_SECRET');
  }

  canActivate(context: ExecutionContext): boolean {
    const header = context.switchToHttp().getRequest<AppRequest>().headers['x-origin-verify'];
    if (isOriginVerified(header, this.secret)) return true;
    throw new ForbiddenException({ code: ERROR_CODES.FORBIDDEN, message: 'Forbidden' });
  }
}
