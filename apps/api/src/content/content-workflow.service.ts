import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { isValidObjectId, trusted, Types, type Model } from 'mongoose';
import {
  CONTENT_PUBLISHER_ROLES,
  CONTENT_TRANSITIONS,
  ERROR_CODES,
  hasAnyRole,
  type ChangeStatus,
  type ContentStatus,
} from '@jfa/shared';
import type { AuditService } from '../audit/audit.module';
import type { RequestUser } from '../common/auth.types';
import type { ContentTypeConfig } from './content-types';
import { toResponse } from './to-response';

type ContentDoc = Record<string, unknown> & {
  _id: unknown;
  slug: string;
  status: ContentStatus;
  version?: number;
  authorId?: string;
};

/**
 * The content review workflow, shared by every content type (one instance per type):
 * draft → in_review (author) → published (reviewer, never the author) → pack build.
 * Only drafts can be edited; every change is written to the audit log.
 */
export class ContentWorkflowService {
  constructor(
    private readonly model: Model<ContentDoc>,
    private readonly audit: AuditService,
    private readonly type: ContentTypeConfig,
  ) {}

  async list(query: { status?: ContentStatus; limit: number; cursor?: string }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    // sanitizeFilter is on globally: server-built operators must be explicitly trusted.
    if (query.cursor) filter._id = trusted({ $lt: new Types.ObjectId(query.cursor) });
    const docs = await this.model.find(filter).sort({ _id: -1 }).limit(query.limit + 1).lean();
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

  async create(input: Record<string, unknown>, user: RequestUser) {
    const data = this.type.sanitize ? this.type.sanitize(input) : input;
    if (await this.model.exists({ slug: data.slug })) {
      throw new ConflictException({ code: ERROR_CODES.CONFLICT, message: 'Slug already exists' });
    }
    const doc = await this.model.create({ ...data, status: 'draft', version: 1, authorId: user.id });
    await this.audit.log({ actor: user, action: `${this.type.entity}.create`, entity: this.type.key, entityId: String(doc._id) });
    return toResponse(doc.toObject() as ContentDoc);
  }

  async update(id: string, input: Record<string, unknown>, user: RequestUser) {
    const doc = await this.findOrThrow(id);
    if (doc.status !== 'draft') {
      throw new ConflictException({ code: ERROR_CODES.INVALID_TRANSITION, message: 'Only drafts can be edited' });
    }
    const data = this.type.sanitize ? this.type.sanitize(input) : input;
    if (typeof data.slug === 'string' && data.slug !== doc.slug && (await this.model.exists({ slug: data.slug }))) {
      throw new ConflictException({ code: ERROR_CODES.CONFLICT, message: 'Slug already exists' });
    }
    const updated = await this.model
      .findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true })
      .lean();
    await this.audit.log({ actor: user, action: `${this.type.entity}.update`, entity: this.type.key, entityId: id });
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
      // Approved by a panel lawyer: no longer starter/sample content.
      set.isSample = false;
    }
    const updated = await this.model.findByIdAndUpdate(id, { $set: set }, { returnDocument: 'after' }).lean();
    await this.audit.log({
      actor: user,
      action: `${this.type.entity}.status.${input.status}`,
      entity: this.type.key,
      entityId: id,
      meta: { from: doc.status, to: input.status, ...(input.note ? { hasNote: true } : {}) },
    });
    return toResponse(updated!);
  }

  private async findOrThrow(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException({ code: ERROR_CODES.VALIDATION_FAILED, message: 'Invalid id' });
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException({ code: ERROR_CODES.NOT_FOUND, message: `${this.type.label} not found` });
    return doc;
  }
}
