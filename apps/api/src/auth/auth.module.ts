import { Global, Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppConfig } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { AUTH_INSTANCE, createAuth, type Auth } from './better-auth';

/** Fixed secret for automated tests only (env validation forbids missing secrets elsewhere). */
const TEST_SECRET = 'test-only-secret-not-for-real-use-0123456789';

@Global()
@Module({
  providers: [
    {
      provide: AUTH_INSTANCE,
      inject: [AppConfig, getConnectionToken()],
      useFactory: async (config: AppConfig, connection: Connection): Promise<Auth | undefined> => {
        // The OpenAPI export runs without a database; auth routes are not part of the spec.
        if (process.env.OPENAPI_EXPORT === '1') return undefined;
        const stage = config.get('STAGE');
        return createAuth({
          secret: config.get('BETTER_AUTH_SECRET') ?? TEST_SECRET,
          baseURL: config.get('BETTER_AUTH_URL') ?? `http://localhost:${config.get('PORT')}`,
          trustedOrigins: config.get('CORS_ORIGINS'),
          isLocal: config.isLocal,
          isTest: stage === 'test',
          connection,
        });
      },
    },
    AuthService,
  ],
  exports: [AUTH_INSTANCE, AuthService],
})
export class AuthModule {}
