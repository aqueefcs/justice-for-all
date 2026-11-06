import {
  DEFAULT_LOCALE,
  PACK_SCHEMA_VERSION,
  ContentPackSchema,
  type ContentPack,
  type Locale,
} from '@jfa/shared';

/** Minimal shape of a lean content document with translations. */
type Doc = {
  isSample?: boolean;
  translations: Partial<Record<Locale, Record<string, any> & { status?: string }>>;
} & Record<string, any>;

/**
 * Picks the translation for `locale` if it is published, otherwise falls back to English.
 * Returns undefined when nothing publishable exists (item is skipped).
 */
export function pickTranslation(doc: Doc, locale: Locale) {
  const t = doc.translations?.[locale];
  if (t && t.status === 'published') return t;
  const fallback = doc.translations?.[DEFAULT_LOCALE];
  if (fallback && fallback.status === 'published') return fallback;
  return undefined;
}

export interface PackSources {
  categories: Doc[];
  acts: Doc[];
  sections: Doc[];
  articles: Doc[];
  guides: Doc[];
  templates: Doc[];
}

/** Pure function: published documents → validated single-locale content pack. */
export function buildPack(src: PackSources, locale: Locale, version: number, now = new Date()): ContentPack {
  const isSample = [src.categories, src.acts, src.sections, src.articles, src.guides, src.templates].some((list) =>
    list.some((d) => d.isSample),
  );

  const categories = src.categories.flatMap((c) => {
    const t = pickTranslation(c, locale);
    return t ? [{ slug: c.slug, icon: c.icon, order: c.order ?? 0, title: t.title, description: t.description }] : [];
  });

  const acts = src.acts.flatMap((a) => {
    const t = pickTranslation(a, locale);
    if (!t) return [];
    const sections = src.sections
      .filter((s) => s.actSlug === a.slug)
      .sort((x, y) => x.order - y.order)
      .flatMap((s) => {
        const st = pickTranslation(s, locale);
        return st
          ? [{
              number: s.number,
              order: s.order,
              title: st.title,
              text: st.text ?? '',
              plainExplanation: st.plainExplanation,
              oldLawRefs: (s.oldLawRefs ?? []).map((r: any) => ({ act: r.act, section: r.section })),
            }]
          : [];
      });
    return [{ slug: a.slug, shortName: a.shortName, year: a.year, title: t.title, summary: t.summary, sourceUrl: a.sourceUrl, sections }];
  });

  const articles = src.articles.flatMap((ar) => {
    const t = pickTranslation(ar, locale);
    return t ? [{ slug: ar.slug, categorySlug: ar.categorySlug, title: t.title, summary: t.summary ?? '', body: t.body ?? '', tags: ar.tags ?? [] }] : [];
  });

  const guides = src.guides.flatMap((g) => {
    const t = pickTranslation(g, locale);
    return t
      ? [{
          slug: g.slug,
          type: g.type,
          categorySlug: g.categorySlug,
          title: t.title,
          summary: t.summary ?? '',
          steps: (t.steps ?? []).map((s: any) => ({ title: s.title, body: s.body })),
          checklist: t.checklist ?? [],
          templateSlugs: g.templateSlugs ?? [],
          externalLinks: (g.externalLinks ?? []).map((l: any) => ({ label: l.label, url: l.url, state: l.state })),
        }]
      : [];
  });

  const templates = src.templates.flatMap((tp) => {
    const t = pickTranslation(tp, locale);
    return t
      ? [{
          slug: tp.slug,
          categorySlug: tp.categorySlug,
          title: t.title,
          summary: t.summary ?? '',
          fields: (tp.fields ?? []).map((f: any) => ({ key: f.key, type: f.type, required: f.required ?? true, maxLength: f.maxLength })),
          fieldLabels: t.fieldLabels ?? {},
          bodyHtml: t.bodyHtml ?? '',
        }]
      : [];
  });

  return ContentPackSchema.parse({
    schemaVersion: PACK_SCHEMA_VERSION,
    locale,
    version,
    generatedAt: now.toISOString(),
    isSample,
    categories: categories.sort((x, y) => x.order - y.order),
    acts,
    articles,
    guides,
    templates,
  });
}
