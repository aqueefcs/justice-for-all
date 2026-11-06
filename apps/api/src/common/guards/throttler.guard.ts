import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limit by the real client IP. Behind Cloudflare the client IP is in `cf-connecting-ip`.
 * NOTE: on Lambda this limit is per execution environment (in-memory); Cloudflare rate-limiting
 * rules are the primary protection. Move to a shared store if precise limits are needed.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, any>): Promise<string> {
    const cf = req.headers?.['cf-connecting-ip'];
    return typeof cf === 'string' && cf.length > 0 ? cf : (req.ip ?? 'unknown');
  }
}
