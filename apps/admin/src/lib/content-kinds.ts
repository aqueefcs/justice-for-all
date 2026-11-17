import type { z } from 'zod';
import { ArticleSchema, CategorySchema, GuideSchema, TemplateSchema, type ContentStatus, type Locale } from '@jfa/shared';

export const KINDS = ['guides', 'articles', 'templates', 'categories'] as const;
export type Kind = (typeof KINDS)[number];
export const isKind = (v: unknown): v is Kind => (KINDS as readonly string[]).includes(v as string);

export const KIND_SCHEMAS: Record<Kind, z.ZodObject> = {
  guides: GuideSchema,
  articles: ArticleSchema,
  templates: TemplateSchema,
  categories: CategorySchema,
};

/** A document as returned by the API: content fields + workflow metadata. */
export type ContentDoc = Record<string, unknown> & {
  id: string;
  slug: string;
  status: ContentStatus;
  version: number;
  authorId?: string;
  reviewerId?: string;
  updatedAt: string;
  isSample?: boolean;
  published?: unknown;
  translations: Partial<Record<Locale, Record<string, unknown>>>;
};

const META_KEYS = ['id', 'status', 'version', 'authorId', 'reviewerId', 'publishedAt', 'updatedAt', 'createdAt', 'isSample', 'published'];

/** Strips workflow metadata so the rest can be edited and sent back. */
export function toFormValues(doc: ContentDoc): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc)) if (!META_KEYS.includes(k)) values[k] = v;
  // Per-locale status is managed by the workflow, not edited by hand.
  const translations = (values.translations ?? {}) as Record<string, Record<string, unknown> | undefined>;
  values.translations = Object.fromEntries(
    Object.entries(translations)
      .filter(([, t]) => t)
      .map(([locale, t]) => {
        const { status: _status, ...rest } = t!;
        return [locale, rest];
      }),
  );
  return values;
}

export function emptyTranslation(kind: Kind): Record<string, unknown> {
  switch (kind) {
    case 'guides':
      return { title: '', summary: '', steps: [{ title: '', body: '' }], checklist: [] };
    case 'articles':
      return { title: '', summary: '', body: '' };
    case 'templates':
      return { title: '', summary: '', fieldLabels: {}, bodyHtml: '' };
    case 'categories':
      return { title: '', description: '' };
  }
}

export function emptyDoc(kind: Kind): Record<string, unknown> {
  const translations = { en: emptyTranslation(kind) };
  switch (kind) {
    case 'guides':
      return { slug: '', type: 'fir', categorySlug: '', templateSlugs: [], externalLinks: [], translations };
    case 'articles':
      return { slug: '', categorySlug: '', tags: [], translations };
    case 'templates':
      return { slug: '', categorySlug: '', fields: [{ key: 'fullName', type: 'text', required: true }], translations };
    case 'categories':
      return { slug: '', icon: 'ribbon', order: 0, translations };
  }
}

export function titleOf(doc: { slug?: string; translations?: Partial<Record<Locale, Record<string, unknown>>> }): string {
  return (doc.translations?.en?.title as string | undefined) || doc.slug || '—';
}
