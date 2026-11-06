import { createHash } from 'node:crypto';
import { Body, Controller, HttpCode, Injectable, Logger, Module, Post, type OnModuleInit } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { modelDefinitions } from '@jfa/db';
import {
  CONTENT_PUBLISHER_ROLES,
  LOCALES,
  LocaleSchema,
  PACK_SCHEMA_VERSION,
  PackManifestSchema,
  type Locale,
  type PackManifest,
} from '@jfa/shared';
import { AuditService } from '../audit/audit.module';
import type { RequestUser } from '../common/auth.types';
import { CurrentUser, Roles } from '../common/decorators';
import { StorageService } from '../integrations/storage/storage.service';
import { JobsService } from '../jobs/jobs.module';
import { buildPack } from './pack-builder';

type AnyModel = Model<any>;

@Injectable()
export class PublishingService implements OnModuleInit {
  private readonly logger = new Logger(PublishingService.name);

  constructor(
    @InjectModel('Category') private readonly categories: AnyModel,
    @InjectModel('Act') private readonly acts: AnyModel,
    @InjectModel('ActSection') private readonly sections: AnyModel,
    @InjectModel('Article') private readonly articles: AnyModel,
    @InjectModel('Guide') private readonly guides: AnyModel,
    @InjectModel('Template') private readonly templates: AnyModel,
    @InjectModel('ContentPack') private readonly packs: AnyModel,
    private readonly storage: StorageService,
    private readonly jobs: JobsService,
  ) {}

  onModuleInit() {
    this.jobs.register('content.publishPacks', (job) => this.publishAll(job.locales, job.requestedBy));
  }

  /** Builds and uploads one pack per locale, then rewrites the manifest. */
  async publishAll(locales: readonly Locale[] = LOCALES, requestedBy?: string) {
    const published = { status: 'published' };
    const [categories, acts, sections, articles, guides, templates] = await Promise.all([
      this.categories.find(published).lean(),
      this.acts.find(published).lean(),
      this.sections.find(published).lean(),
      this.articles.find(published).lean(),
      this.guides.find(published).lean(),
      this.templates.find(published).lean(),
    ]);
    const sources = { categories, acts, sections, articles, guides, templates } as any;

    const results: PackManifest['packs'] = [];
    for (const locale of locales) {
      const last = await this.packs.findOne({ locale }).sort({ version: -1 }).lean<{ version: number }>();
      const version = (last?.version ?? 0) + 1;
      const pack = buildPack(sources, locale, version);
      const json = JSON.stringify(pack);
      const sha256 = createHash('sha256').update(json).digest('hex');
      const key = `packs/${locale}/v${version}.json`;
      const { url } = await this.storage.putPublic(key, json, 'application/json', 'public, max-age=31536000, immutable');
      await this.packs.create({ locale, version, r2Key: key, sha256, sizeBytes: Buffer.byteLength(json), builtBy: undefined });
      results.push({ locale, version, url, sha256, sizeBytes: Buffer.byteLength(json) });
      this.logger.log(`Published pack ${key} (${pack.guides.length} guides, sample=${pack.isSample})`);
    }

    const manifest = PackManifestSchema.parse({ schemaVersion: PACK_SCHEMA_VERSION, packs: results });
    await this.storage.putPublic('packs/manifest.json', JSON.stringify(manifest), 'application/json', 'public, max-age=60');
    this.logger.log(`Manifest updated${requestedBy ? ` (requested by ${requestedBy})` : ''}`);
    return manifest;
  }
}

const PublishPacksSchema = z.object({ locales: z.array(LocaleSchema).min(1).optional() });
class PublishPacksDto extends createZodDto(PublishPacksSchema) {}
class PublishPacksResponseDto extends createZodDto(
  z.object({ queued: z.boolean(), manifest: PackManifestSchema.optional() }),
) {}

@ApiTags('publishing')
@Controller('publishing')
export class PublishingController {
  constructor(
    private readonly jobs: JobsService,
    private readonly audit: AuditService,
  ) {}

  /** Rebuild content packs from all published content (queued on AWS, inline locally). */
  @Post('packs')
  @HttpCode(200)
  @Roles(...CONTENT_PUBLISHER_ROLES)
  @ApiOkResponse({ type: PublishPacksResponseDto })
  async publish(@Body() body: PublishPacksDto, @CurrentUser() user: RequestUser) {
    const { queued, result } = await this.jobs.enqueue({ type: 'content.publishPacks', locales: body.locales, requestedBy: user.id });
    await this.audit.log({ actor: user, action: 'packs.publish', entity: 'contentPacks', meta: { queued } });
    return { queued, manifest: queued ? undefined : (result as PackManifest) };
  }
}

@Module({
  imports: [
    MongooseModule.forFeature(
      modelDefinitions(['Category', 'Act', 'ActSection', 'Article', 'Guide', 'Template', 'ContentPack']),
    ),
  ],
  controllers: [PublishingController],
  providers: [PublishingService],
  exports: [PublishingService],
})
export class PublishingModule {}
