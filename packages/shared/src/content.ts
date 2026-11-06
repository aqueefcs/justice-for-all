import { z } from 'zod';
import { LocaleSchema } from './locales';

// ---------------------------------------------------------------------------
// Common building blocks
// ---------------------------------------------------------------------------

export const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
export const SlugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens');

export const CONTENT_STATUSES = ['draft', 'in_review', 'published', 'archived'] as const;
export const ContentStatusSchema = z.enum(CONTENT_STATUSES);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

/** Allowed status transitions for the review workflow. */
export const CONTENT_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  draft: ['in_review', 'archived'],
  in_review: ['draft', 'published'],
  published: ['draft', 'archived'],
  archived: ['draft'],
};

/** Builds a `translations` record schema: `{ en: {...}, hi?: {...} }` — English is required. */
export function translationsOf<T extends z.ZodTypeAny>(localeSchema: T) {
  return z
    .partialRecord(LocaleSchema, localeSchema)
    .refine((t) => t.en !== undefined, { message: 'English (en) translation is required' });
}

/** Per-locale status lets a translation lag behind the English source. */
const localeStatus = { status: ContentStatusSchema.default('draft') };

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export const CategoryLocaleSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  ...localeStatus,
});

export const CategorySchema = z.object({
  slug: SlugSchema,
  icon: z.string().min(1).max(60),
  order: z.number().int().min(0).default(0),
  translations: translationsOf(CategoryLocaleSchema),
});
export type Category = z.infer<typeof CategorySchema>;

// ---------------------------------------------------------------------------
// Acts & sections (bare acts from India Code)
// ---------------------------------------------------------------------------

export const ActSchema = z.object({
  slug: SlugSchema,
  shortName: z.string().min(1).max(20), // e.g. BNS
  year: z.number().int().min(1800).max(2100),
  categorySlugs: z.array(SlugSchema).default([]),
  sourceUrl: z.url().optional(),
  translations: translationsOf(
    z.object({ title: z.string().min(1).max(200), summary: z.string().max(1000).optional(), ...localeStatus }),
  ),
});
export type Act = z.infer<typeof ActSchema>;

/** Mapping to the old law, e.g. BNS 103 ↔ IPC 302. */
export const OldLawRefSchema = z.object({
  act: z.string().min(1).max(20), // IPC | CrPC | IEA
  section: z.string().min(1).max(20),
});

export const ActSectionSchema = z.object({
  actSlug: SlugSchema,
  number: z.string().min(1).max(20),
  order: z.number().int().min(0),
  oldLawRefs: z.array(OldLawRefSchema).default([]),
  translations: translationsOf(
    z.object({
      title: z.string().min(1).max(300),
      text: z.string().max(50_000),
      plainExplanation: z.string().max(10_000).optional(),
      ...localeStatus,
    }),
  ),
});
export type ActSection = z.infer<typeof ActSectionSchema>;

// ---------------------------------------------------------------------------
// Articles (explainers / FAQs)
// ---------------------------------------------------------------------------

export const ArticleSchema = z.object({
  slug: SlugSchema,
  categorySlug: SlugSchema,
  tags: z.array(z.string().max(40)).max(20).default([]),
  translations: translationsOf(
    z.object({
      title: z.string().min(1).max(200),
      summary: z.string().max(500),
      body: z.string().max(50_000), // sanitized HTML from the CMS editor
      ...localeStatus,
    }),
  ),
});
export type Article = z.infer<typeof ArticleSchema>;

// ---------------------------------------------------------------------------
// Guides (FIR, GD, complaints, RTI …)
// ---------------------------------------------------------------------------

export const GUIDE_TYPES = ['fir', 'gd', 'complaint', 'rti', 'drafting', 'other'] as const;
export const GuideTypeSchema = z.enum(GUIDE_TYPES);

export const GuideStepSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(5_000),
});

export const GuideSchema = z.object({
  slug: SlugSchema,
  type: GuideTypeSchema,
  categorySlug: SlugSchema,
  templateSlugs: z.array(SlugSchema).default([]),
  externalLinks: z
    .array(z.object({ label: z.string().max(120), url: z.url(), state: z.string().max(60).optional() }))
    .default([]),
  translations: translationsOf(
    z.object({
      title: z.string().min(1).max(200),
      summary: z.string().max(500),
      steps: z.array(GuideStepSchema).min(1).max(50),
      checklist: z.array(z.string().max(200)).max(50).default([]),
      ...localeStatus,
    }),
  ),
});
export type Guide = z.infer<typeof GuideSchema>;

// ---------------------------------------------------------------------------
// Drafting templates (filled on-device → PDF)
// ---------------------------------------------------------------------------

export const TEMPLATE_FIELD_TYPES = ['text', 'multiline', 'date', 'number', 'phone'] as const;

export const TemplateFieldSchema = z.object({
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  type: z.enum(TEMPLATE_FIELD_TYPES),
  required: z.boolean().default(true),
  maxLength: z.number().int().positive().max(5_000).optional(),
});
export type TemplateField = z.infer<typeof TemplateFieldSchema>;

export const TemplateSchema = z.object({
  slug: SlugSchema,
  categorySlug: SlugSchema,
  fields: z.array(TemplateFieldSchema).min(1).max(60),
  translations: translationsOf(
    z.object({
      title: z.string().min(1).max(200),
      summary: z.string().max(500),
      /** Field labels keyed by field key. */
      fieldLabels: z.record(z.string(), z.string().max(200)),
      /** HTML with {{fieldKey}} placeholders. */
      bodyHtml: z.string().max(100_000),
      ...localeStatus,
    }),
  ),
});
export type Template = z.infer<typeof TemplateSchema>;

// ---------------------------------------------------------------------------
// Publishing metadata (added by the API, never sent by clients)
// ---------------------------------------------------------------------------

export const PublishingMetaSchema = z.object({
  id: ObjectIdSchema,
  status: ContentStatusSchema,
  version: z.number().int().min(1),
  authorId: ObjectIdSchema.optional(),
  reviewerId: ObjectIdSchema.optional(),
  publishedAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime(),
});

export const ChangeStatusSchema = z.object({
  status: ContentStatusSchema,
  note: z.string().max(1_000).optional(),
});
export type ChangeStatus = z.infer<typeof ChangeStatusSchema>;
