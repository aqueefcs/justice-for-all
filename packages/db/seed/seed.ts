/**
 * Seeds the database with SAMPLE content (from @jfa/shared SAMPLE_PACK_EN).
 * Usage: MONGODB_URI=... pnpm --filter @jfa/db seed
 * Safe to re-run: upserts by slug. Everything is flagged isSample=true.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { SAMPLE_PACK_EN } from '@jfa/shared';
import { connectForScript } from '../src/index';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  if (process.env.STAGE === 'prod') throw new Error('Refusing to seed SAMPLE data into prod');

  await connectForScript(uri);
  const m = mongoose.models;
  const sample = { status: 'published', isSample: true, publishedAt: new Date() };
  const en = (fields: Record<string, unknown>) => ({ en: { ...fields, status: 'published' } });

  const p = SAMPLE_PACK_EN;
  for (const c of p.categories) {
    await m.Category!.updateOne(
      { slug: c.slug },
      { $set: { slug: c.slug, icon: c.icon, order: c.order, translations: en({ title: c.title, description: c.description }), ...sample } },
      { upsert: true },
    );
  }
  for (const a of p.acts) {
    await m.Act!.updateOne(
      { slug: a.slug },
      { $set: { slug: a.slug, shortName: a.shortName, year: a.year, sourceUrl: a.sourceUrl, translations: en({ title: a.title, summary: a.summary }), ...sample } },
      { upsert: true },
    );
    for (const s of a.sections) {
      await m.ActSection!.updateOne(
        { actSlug: a.slug, number: s.number },
        { $set: { actSlug: a.slug, number: s.number, order: s.order, oldLawRefs: s.oldLawRefs, translations: en({ title: s.title, text: s.text, plainExplanation: s.plainExplanation }), ...sample } },
        { upsert: true },
      );
    }
  }
  for (const ar of p.articles) {
    await m.Article!.updateOne(
      { slug: ar.slug },
      { $set: { slug: ar.slug, categorySlug: ar.categorySlug, tags: ar.tags, translations: en({ title: ar.title, summary: ar.summary, body: ar.body }), ...sample } },
      { upsert: true },
    );
  }
  for (const g of p.guides) {
    await m.Guide!.updateOne(
      { slug: g.slug },
      { $set: { slug: g.slug, type: g.type, categorySlug: g.categorySlug, templateSlugs: g.templateSlugs, externalLinks: g.externalLinks, translations: en({ title: g.title, summary: g.summary, steps: g.steps, checklist: g.checklist }), ...sample } },
      { upsert: true },
    );
  }
  for (const t of p.templates) {
    await m.Template!.updateOne(
      { slug: t.slug },
      { $set: { slug: t.slug, categorySlug: t.categorySlug, fields: t.fields, translations: en({ title: t.title, summary: t.summary, fieldLabels: t.fieldLabels, bodyHtml: t.bodyHtml }), ...sample } },
      { upsert: true },
    );
  }
  await Promise.all(Object.values(m).map((model) => model.syncIndexes()));
  console.log('✓ Seeded SAMPLE content and synced indexes');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
