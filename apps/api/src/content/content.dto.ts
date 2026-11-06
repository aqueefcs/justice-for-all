import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  CategorySchema,
  ChangeStatusSchema,
  ContentStatusSchema,
  GuideSchema,
  ObjectIdSchema,
  PublishingMetaSchema,
} from '@jfa/shared';

export class CreateGuideDto extends createZodDto(GuideSchema) {}
export class UpdateGuideDto extends createZodDto(GuideSchema.partial()) {}
export class ChangeStatusDto extends createZodDto(ChangeStatusSchema) {}

export const ListQuerySchema = z.object({
  status: ContentStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  /** Cursor = last seen id (results are newest first). */
  cursor: ObjectIdSchema.optional(),
});
export class ListQueryDto extends createZodDto(ListQuerySchema) {}

export const GuideResponseSchema = GuideSchema.extend(PublishingMetaSchema.shape);
export class GuideResponseDto extends createZodDto(GuideResponseSchema) {}
export class GuideListResponseDto extends createZodDto(
  z.object({ items: z.array(GuideResponseSchema), nextCursor: z.string().nullable() }),
) {}

export const CategoryResponseSchema = CategorySchema.extend(PublishingMetaSchema.shape);
export class CategoryListResponseDto extends createZodDto(z.object({ items: z.array(CategoryResponseSchema) })) {}
