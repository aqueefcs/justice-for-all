import { Controller, Get, Global, Injectable, Module } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ADMIN_ROLES, IntegrationStatusSchema, type IntegrationStatus } from '@jfa/shared';
import { AuthService } from '../auth/auth.service';
import { Roles } from '../common/decorators';
import { AnalyticsService } from './analytics/analytics.service';
import { EmailService } from './email/email.service';
import { ErrorTrackingService } from './error-tracking/error-tracking.service';
import { MalwareScanService } from './malware-scan/malware-scan.service';
import { PaymentsService } from './payments/payments.service';
import { PushService } from './push/push.service';
import { QueueService } from './queue/queue.service';
import { SmsService } from './sms/sms.service';
import { StorageService } from './storage/storage.service';
import { TranslationService } from './translation/translation.service';
import { VideoService } from './video/video.service';

const SERVICES = [
  StorageService,
  QueueService,
  EmailService,
  SmsService,
  PushService,
  PaymentsService,
  VideoService,
  TranslationService,
  MalwareScanService,
  ErrorTrackingService,
  AnalyticsService,
];

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly auth: AuthService,
    private readonly storage: StorageService,
    private readonly queue: QueueService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
    private readonly push: PushService,
    private readonly payments: PaymentsService,
    private readonly video: VideoService,
    private readonly translation: TranslationService,
    private readonly malwareScan: MalwareScanService,
    private readonly errorTracking: ErrorTrackingService,
    private readonly analytics: AnalyticsService,
  ) {}

  statuses(): IntegrationStatus[] {
    return [
      { name: 'auth', provider: 'Better Auth', configured: this.auth.isConfigured, phase: 'mvp' },
      ...[
        this.storage,
        this.queue,
        this.email,
        this.sms,
        this.push,
        this.payments,
        this.video,
        this.translation,
        this.malwareScan,
        this.errorTracking,
        this.analytics,
      ].map((s) => s.status()),
    ];
  }
}

class IntegrationStatusListDto extends createZodDto(z.array(IntegrationStatusSchema)) {}

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrations: IntegrationsService) {}

  @Get()
  @Roles(...ADMIN_ROLES)
  @ApiOkResponse({ type: IntegrationStatusListDto })
  list(): IntegrationStatus[] {
    return this.integrations.statuses();
  }
}

@Global()
@Module({
  controllers: [IntegrationsController],
  providers: [...SERVICES, IntegrationsService],
  exports: [...SERVICES, IntegrationsService],
})
export class IntegrationsModule {}
