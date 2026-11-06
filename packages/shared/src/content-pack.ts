import { z } from 'zod';
import { LocaleSchema } from './locales';
import { GuideTypeSchema, OldLawRefSchema, TemplateFieldSchema, GuideStepSchema } from './content';

/**
 * Content packs are what the mobile app downloads (ADR 0003).
 * A pack is single-locale and flattened: no `translations` maps, no workflow fields.
 * Bump PACK_SCHEMA_VERSION on any breaking shape change and keep the app reader backward compatible.
 */
export const PACK_SCHEMA_VERSION = 1;

export const PackCategorySchema = z.object({
  slug: z.string(),
  icon: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string().optional(),
});

export const PackActSchema = z.object({
  slug: z.string(),
  shortName: z.string(),
  year: z.number(),
  title: z.string(),
  summary: z.string().optional(),
  sourceUrl: z.string().optional(),
  sections: z.array(
    z.object({
      number: z.string(),
      order: z.number(),
      title: z.string(),
      text: z.string(),
      plainExplanation: z.string().optional(),
      oldLawRefs: z.array(OldLawRefSchema),
    }),
  ),
});

export const PackArticleSchema = z.object({
  slug: z.string(),
  categorySlug: z.string(),
  title: z.string(),
  summary: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
});

export const PackGuideSchema = z.object({
  slug: z.string(),
  type: GuideTypeSchema,
  categorySlug: z.string(),
  title: z.string(),
  summary: z.string(),
  steps: z.array(GuideStepSchema),
  checklist: z.array(z.string()),
  templateSlugs: z.array(z.string()),
  externalLinks: z.array(z.object({ label: z.string(), url: z.string(), state: z.string().optional() })),
});

export const PackTemplateSchema = z.object({
  slug: z.string(),
  categorySlug: z.string(),
  title: z.string(),
  summary: z.string(),
  fields: z.array(TemplateFieldSchema),
  fieldLabels: z.record(z.string(), z.string()),
  bodyHtml: z.string(),
});

export const ContentPackSchema = z.object({
  schemaVersion: z.literal(PACK_SCHEMA_VERSION),
  locale: LocaleSchema,
  version: z.number().int().min(1),
  generatedAt: z.string(),
  /** True while the pack contains un-reviewed SAMPLE content. The app shows a banner. */
  isSample: z.boolean(),
  categories: z.array(PackCategorySchema),
  acts: z.array(PackActSchema),
  articles: z.array(PackArticleSchema),
  guides: z.array(PackGuideSchema),
  templates: z.array(PackTemplateSchema),
});
export type ContentPack = z.infer<typeof ContentPackSchema>;
export type PackCategory = z.infer<typeof PackCategorySchema>;
export type PackAct = z.infer<typeof PackActSchema>;
export type PackArticle = z.infer<typeof PackArticleSchema>;
export type PackGuide = z.infer<typeof PackGuideSchema>;
export type PackTemplate = z.infer<typeof PackTemplateSchema>;

/** Published at `<CONTENT_CDN_URL>/packs/manifest.json`; the app polls it to sync. */
export const PackManifestSchema = z.object({
  schemaVersion: z.literal(PACK_SCHEMA_VERSION),
  packs: z.array(
    z.object({
      locale: LocaleSchema,
      version: z.number().int().min(1),
      url: z.string(),
      sha256: z.string(),
      sizeBytes: z.number().int().nonnegative(),
    }),
  ),
});
export type PackManifest = z.infer<typeof PackManifestSchema>;
