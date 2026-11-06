import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, trusted, Types, type Model } from 'mongoose';
import {
  CONTENT_PUBLISHER_ROLES,
  CONTENT_TRANSITIONS,
  ERROR_CODES,
  hasAnyRole,
  type ChangeStatus,
  type ContentStatus,
  type Guide,
} from '@jfa/shared';
import { AuditService } from '../audit/audit.module';
import type { RequestUser } from '../common/auth.types';
import { toResponse } from './to-response';

type GuideDoc = Guide & { _id: unknown; status: ContentStatus; version: number; authorId?: string; isSample?: boolean };

/**
 * Reference implementation of the content review workflow (copy this pattern for
 * articles, acts, templates — see the `add-content-type` skill).
 * draft → in_review (author) → published (reviewer, not the author) → pack build.
 */
@Injectable()
export class GuidesService {
  constructor(
    @InjectModel('Guide') private readonly guides: Model<GuideDoc>,
    private readonly audit: AuditService,
  ) {}

  async list(query: { status?: ContentStatus; limit: number; cursor?: string }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    // sanitizeFilter is on globally: server-built operators must be explicitly trusted.
    if (query.cursor) filter._id = trusted({ $lt: new Types.ObjectId(query.cursor) });
    const docs = await this.guides
      .find(filter)
      .sort({ _id: -1 })
      .limit(query.limit + 1)
      .lean();
    const hasMore = docs.length > query.limit;
    const page = hasMore ? docs.slice(0, query.limit) : docs;
    return {
      items: page.map((d) => toResponse(d)),
      nextCursor: hasMore ? String(page[page.length - 1]?._id) : null,
    };
  }

  async get(id: string) {
    return toResponse(await this.findOrThrow(id));
  }

  async create(input: Guide, user: RequestUser) {
    const exists = await this.guides.exists({ slug: input.slug });
    if (exists) throw new ConflictException({ code: ERROR_CODES.CONFLICT, message: 'Slug already exists' });
    const doc = await this.guides.create({ ...input, status: 'draft', version: 1, authorId: user.id });
    await this.audit.log({ actor: user, action: 'guide.create', entity: 'guides', entityId: String(doc._id) });
    return toResponse(doc.toObject());
  }

  async update(id: string, input: Partial<Guide>, user: RequestUser) {
    const doc = await this.findOrThrow(id);
    if (doc.status !== 'draft') {
      throw new ConflictException({ code: ERROR_CODES.INVALID_TRANSITION, message: 'Only drafts can be edited' });
    }
    const updated = await this.guides.findByIdAndUpdate(id, { $set: input }, { returnDocument: 'after', runValidators: true }).lean();
    await this.audit.log({ actor: user, action: 'guide.update', entity: 'guides', entityId: id });
    return toResponse(updated!);
  }

  async changeStatus(id: string, input: ChangeStatus, user: RequestUser) {
    const doc = await this.findOrThrow(id);
    const allowed = CONTENT_TRANSITIONS[doc.status];
    if (!allowed.includes(input.status)) {
      throw new ConflictException({
        code: ERROR_CODES.INVALID_TRANSITION,
        message: `Cannot move from ${doc.status} to ${input.status}`,
      });
    }
    const set: Record<string, unknown> = { status: input.status };
    if (input.status === 'published') {
      if (!hasAnyRole(user.role, CONTENT_PUBLISHER_ROLES)) {
        throw new ForbiddenException({ code: ERROR_CODES.FORBIDDEN, message: 'Only reviewers can publish' });
      }
      // Four-eyes rule: an author cannot approve their own content.
      if (doc.authorId && doc.authorId === user.id) {
        throw new ForbiddenException({ code: ERROR_CODES.FORBIDDEN, message: 'Authors cannot publish their own content' });
      }
      set.reviewerId = user.id;
      set.publishedAt = new Date();
      set.version = (doc.version ?? 1) + 1;
    }
    const updated = await this.guides.findByIdAndUpdate(id, { $set: set }, { returnDocument: 'after' }).lean();
    await this.audit.log({
      actor: user,
      action: `guide.status.${input.status}`,
      entity: 'guides',
      entityId: id,
      meta: { from: doc.status, to: input.status },
    });
    return toResponse(updated!);
  }

  private async findOrThrow(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException({ code: ERROR_CODES.VALIDATION_FAILED, message: 'Invalid id' });
    const doc = await this.guides.findById(id).lean();
    if (!doc) throw new NotFoundException({ code: ERROR_CODES.NOT_FOUND, message: 'Guide not found' });
    return doc;
  }
}
