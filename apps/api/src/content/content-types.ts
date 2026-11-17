import type { z } from 'zod';
import { ArticleSchema, CategorySchema, GuideSchema, TemplateSchema } from '@jfa/shared';
import type { ModelName } from '@jfa/db';
import { sanitizeArticle, sanitizeTemplate } from './sanitize';

/**
 * Every content type editable in the CMS, with the same review workflow.
 * To add one: register it here (see the `add-content-type` skill) — routes, workflow,
 * review queue and audit logging follow automatically.
 */
export interface ContentTypeConfig {
  /** URL segment: /v1/content/<key> */
  key: 'guides' | 'articles' | 'templates' | 'categories';
  model: Extract<ModelName, 'Guide' | 'Article' | 'Template' | 'Category'>;
  /** Singular, used in audit actions (`guide.create`) and messages. */
  entity: string;
  /** PascalCase, used for OpenAPI schema names. */
  label: string;
  schema: z.ZodObject;
  sanitize?: <T extends object>(input: T) => T;
}

export const CONTENT_TYPES: readonly ContentTypeConfig[] = [
  { key: 'guides', model: 'Guide', entity: 'guide', label: 'Guide', schema: GuideSchema },
  { key: 'articles', model: 'Article', entity: 'article', label: 'Article', schema: ArticleSchema, sanitize: sanitizeArticle },
  { key: 'templates', model: 'Template', entity: 'template', label: 'Template', schema: TemplateSchema, sanitize: sanitizeTemplate },
  { key: 'categories', model: 'Category', entity: 'category', label: 'Category', schema: CategorySchema },
];

export const contentServiceToken = (key: ContentTypeConfig['key']) => `ContentWorkflow:${key}`;
