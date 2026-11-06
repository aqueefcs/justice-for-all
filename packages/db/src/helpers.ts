import { Schema, type SchemaDefinition } from 'mongoose';
import { CONTENT_STATUSES, LOCALES, DEFAULT_LOCALE } from '@jfa/shared';

/** Common options: timestamps, strict writes, no `__v` noise in API output. */
export const baseOptions = {
  timestamps: true,
  strict: 'throw' as const,
  versionKey: false as const,
};

/**
 * `translations: { en: {...required}, hi: {...optional} }`
 * One document per entity, never one per language (see .claude/rules/mongodb.md).
 */
export function translationsField(definition: SchemaDefinition) {
  const localeSchema = new Schema(
    { ...definition, status: { type: String, enum: CONTENT_STATUSES, default: 'draft' } },
    { _id: false, strict: 'throw' },
  );
  const fields: Record<string, unknown> = {};
  for (const locale of LOCALES) {
    fields[locale] = { type: localeSchema, required: locale === DEFAULT_LOCALE };
  }
  return { type: new Schema(fields, { _id: false, strict: 'throw' }), required: true };
}

/** Review-workflow fields shared by all publishable content. */
export const publishingFields = {
  status: { type: String, enum: CONTENT_STATUSES, default: 'draft', index: true },
  version: { type: Number, default: 1, min: 1 },
  /** Better Auth user ids (strings). */
  authorId: { type: String },
  reviewerId: { type: String },
  publishedAt: { type: Date },
  /** True for un-reviewed SAMPLE seed data. Must be false before public release. */
  isSample: { type: Boolean, default: false },
} satisfies SchemaDefinition;
