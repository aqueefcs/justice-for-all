import { timingSafeEqual } from 'node:crypto';
import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { ERROR_CODES } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import type { AppRequest } from '../auth.types';

/**
 * Locks the API to Cloudflare: Cloudflare adds `x-origin-verify: <secret>` via a Transform Rule,
 * so calling the raw Lambda Function URL directly is rejected. Disabled when no secret is set (local).
 */
@Injectable()
export class OriginVerifyGuard implements CanActivate {
  private readonly secret: Buffer | undefined;

  constructor(config: AppConfig) {
    const s = config.get('ORIGIN_VERIFY_SECRET');
    this.secret = s ? Buffer.from(s) : undefined;
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.secret) return true;
    const header = context.switchToHttp().getRequest<AppRequest>().headers['x-origin-verify'];
    const provided = Buffer.from(typeof header === 'string' ? header : '');
    if (provided.length === this.secret.length && timingSafeEqual(provided, this.secret)) return true;
    throw new ForbiddenException({ code: ERROR_CODES.FORBIDDEN, message: 'Forbidden' });
  }
}
