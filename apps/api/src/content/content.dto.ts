import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CONTENT_STATUSES, ContentStatusSchema, ObjectIdSchema } from '@jfa/shared';

export const ListQuerySchema = z.object({
  status: ContentStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  /** Cursor = last seen id (results are newest first). */
  cursor: ObjectIdSchema.optional(),
});
export class ListQueryDto extends createZodDto(ListQuerySchema) {}

const ContentKindSchema = z.enum(['guides', 'articles', 'templates', 'categories']);

/** One item waiting for a reviewer, across all content types. */
export const ReviewQueueItemSchema = z.object({
  kind: ContentKindSchema,
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  authorId: z.string().optional(),
  updatedAt: z.string(),
});
export class ReviewQueueDto extends createZodDto(z.object({ items: z.array(ReviewQueueItemSchema) })) {}

/** Counts per content type and status, for the admin dashboard. */
export const ContentSummarySchema = z.object({
  kinds: z.array(
    z.object({
      kind: ContentKindSchema,
      counts: z.object(Object.fromEntries(CONTENT_STATUSES.map((s) => [s, z.number().int()])) as Record<(typeof CONTENT_STATUSES)[number], z.ZodNumber>),
    }),
  ),
});
export class ContentSummaryDto extends createZodDto(ContentSummarySchema) {}
