import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { modelDefinitions } from '@jfa/db';
import type { RequestUser } from '../common/auth.types';

export interface AuditEntry {
  actor?: RequestUser;
  action: string; // e.g. 'guide.create', 'guide.status.published'
  entity: string; // collection / entity name
  entityId?: string;
  /** Non-personal metadata only (ids, statuses, versions). */
  meta?: Record<string, string | number | boolean | null>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectModel('AuditLog') private readonly auditLogs: Model<unknown>) {}

  /** Never throws — audit failures are logged, not surfaced to the user. */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.auditLogs.create({
        actorId: entry.actor?.id,
        actorRole: entry.actor?.role,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        meta: entry.meta,
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log for ${entry.action}: ${(err as Error).message}`);
    }
  }
}

@Global()
@Module({
  imports: [MongooseModule.forFeature(modelDefinitions(['AuditLog']))],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
