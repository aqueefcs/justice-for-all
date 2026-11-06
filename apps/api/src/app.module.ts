import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { AuthGuard } from './common/guards/auth.guard';
import { OriginVerifyGuard } from './common/guards/origin-verify.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AppThrottlerGuard } from './common/guards/throttler.guard';
import { AppConfig } from './config/app-config.service';
import { AppConfigModule } from './config/config.module';
import { ContentModule } from './content/content.module';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { JobsModule } from './jobs/jobs.module';
import { PublishingModule } from './publishing/publishing.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        uri: config.get('MONGODB_URI'),
        // Lambda: one small pool per execution environment (see .claude/rules/mongodb.md)
        maxPoolSize: config.get('MONGODB_MAX_POOL_SIZE'),
        serverSelectionTimeoutMS: 5_000,
        // OpenAPI export runs without a database.
        lazyConnection: process.env.OPENAPI_EXPORT === '1',
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    AuthModule,
    IntegrationsModule,
    AuditModule,
    JobsModule,
    HealthModule,
    ContentModule,
    PublishingModule,
    // PHASE 2: UsersModule (consent, DPDP export/delete), LawyersModule, DocumentsModule
    // PHASE 3: ConsultationsModule, PaymentsModule (webhooks), CallsModule
  ],
  providers: [
    // Guard order matters: origin lock → rate limit → authentication → roles.
    { provide: APP_GUARD, useClass: OriginVerifyGuard },
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
