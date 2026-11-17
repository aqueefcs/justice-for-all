import { Controller, Get, Module } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { getModelToken, InjectModel, MongooseModule } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { modelDefinitions } from '@jfa/db';
import { CONTENT_AUTHOR_ROLES, CONTENT_PUBLISHER_ROLES, CONTENT_STATUSES } from '@jfa/shared';
import { AuditService } from '../audit/audit.module';
import { Roles } from '../common/decorators';
import { createContentController } from './content-controller.factory';
import { ContentSummaryDto, ReviewQueueDto } from './content.dto';
import { CONTENT_TYPES, contentServiceToken, type ContentTypeConfig } from './content-types';
import { ContentWorkflowService } from './content-workflow.service';

type AnyModel = Model<Record<string, any>>;

/** Cross-type views for reviewers and the dashboard. */
@ApiTags('content')
@Controller('content')
export class ContentOverviewController {
  private readonly models: { kind: ContentTypeConfig['key']; model: AnyModel }[];

  constructor(
    @InjectModel('Guide') guides: AnyModel,
    @InjectModel('Article') articles: AnyModel,
    @InjectModel('Template') templates: AnyModel,
    @InjectModel('Category') categories: AnyModel,
  ) {
    this.models = [
      { kind: 'guides', model: guides },
      { kind: 'articles', model: articles },
      { kind: 'templates', model: templates },
      { kind: 'categories', model: categories },
    ];
  }

  /** Everything waiting for a reviewer, oldest first. */
  @Get('review-queue')
  @Roles(...CONTENT_PUBLISHER_ROLES)
  @ApiOkResponse({ type: ReviewQueueDto })
  async reviewQueue() {
    const lists = await Promise.all(
      this.models.map(async ({ kind, model }) => {
        const docs = await model
          .find({ status: 'in_review' })
          .select({ slug: 1, 'translations.en.title': 1, authorId: 1, updatedAt: 1 })
          .sort({ updatedAt: 1 })
          .limit(200)
          .lean();
        return docs.map((d) => ({
          kind,
          id: String(d._id),
          slug: d.slug as string,
          title: (d.translations?.en?.title as string | undefined) ?? (d.slug as string),
          authorId: d.authorId as string | undefined,
          updatedAt: (d.updatedAt as Date).toISOString(),
        }));
      }),
    );
    return { items: lists.flat().sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)) };
  }

  /** Counts per type and status. */
  @Get('summary')
  @Roles(...CONTENT_AUTHOR_ROLES)
  @ApiOkResponse({ type: ContentSummaryDto })
  async summary() {
    const kinds = await Promise.all(
      this.models.map(async ({ kind, model }) => {
        const rows = await model.aggregate<{ _id: string; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
        const counts = Object.fromEntries(CONTENT_STATUSES.map((s) => [s, rows.find((r) => r._id === s)?.n ?? 0]));
        return { kind, counts };
      }),
    );
    return { kinds };
  }
}

@Module({
  imports: [MongooseModule.forFeature(modelDefinitions(CONTENT_TYPES.map((t) => t.model)))],
  controllers: [...CONTENT_TYPES.map(createContentController), ContentOverviewController],
  providers: CONTENT_TYPES.map((type) => ({
    provide: contentServiceToken(type.key),
    inject: [getModelToken(type.model), AuditService],
    useFactory: (model: AnyModel, audit: AuditService) => new ContentWorkflowService(model as never, audit, type),
  })),
})
export class ContentModule {}
