import { Injectable, Logger } from '@nestjs/common';
import { RoleSchema } from '@jfa/shared';
import { AppConfig } from '../config/app-config.service';
import type { AppRequest, RequestUser } from '../common/auth.types';

/**
 * PLACEHOLDER — Better Auth integration.
 *
 * TODO(Phase 1): add `better-auth` + `@thallesp/nestjs-better-auth` with the MongoDB adapter:
 *   - staff: email + password + 2FA (twoFactor plugin), admin plugin for roles
 *   - Phase 2 citizens: phoneNumber plugin (OTP via SmsService/MSG91) + Google social login
 *   - sessions: httpOnly cookies (web) / bearer tokens stored in expo-secure-store (mobile)
 * Then implement `resolveUser` from the Better Auth session and map to our `users` collection.
 *
 * Until then: no real sign-in exists. In STAGE=local|test with ALLOW_DEV_AUTH=true, the
 * `x-dev-role` header impersonates a role so staff routes can be developed and tested.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly config: AppConfig) {}

  get isConfigured(): boolean {
    return Boolean(this.config.get('BETTER_AUTH_SECRET'));
  }

  async resolveUser(request: AppRequest): Promise<RequestUser | undefined> {
    if (this.config.isLocal && this.config.get('ALLOW_DEV_AUTH')) {
      const header = request.headers['x-dev-role'];
      const parsed = RoleSchema.safeParse(header);
      if (parsed.success) {
        return { id: `dev-${parsed.data}`, role: parsed.data, isDev: true };
      }
    }
    // TODO(Phase 1): resolve Better Auth session here.
    return undefined;
  }
}
