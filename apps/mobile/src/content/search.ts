import type { ContentPack } from '@jfa/shared';

export type SearchHit =
  | { kind: 'section'; actSlug: string; number: string; title: string; subtitle: string }
  | { kind: 'guide'; slug: string; title: string; subtitle: string }
  | { kind: 'article'; slug: string; title: string; subtitle: string }
  | { kind: 'template'; slug: string; title: string; subtitle: string };

const norm = (s: string) => s.toLocaleLowerCase().normalize('NFC');

/**
 * Simple in-memory search over the pack (fine for MVP-sized packs).
 * Matches act shortName + section number ("BNS 103"), old-law refs ("IPC 302"), and titles.
 * TODO(Phase 1): replace with SQLite FTS5 once real bare acts are imported.
 */
export function searchPack(pack: ContentPack, query: string, limit = 30): SearchHit[] {
  const q = norm(query.trim());
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];

  for (const act of pack.acts) {
    for (const s of act.sections) {
      const keys = [
        `${act.shortName} ${s.number}`,
        s.title,
        ...s.oldLawRefs.map((r) => `${r.act} ${r.section}`),
      ].map(norm);
      if (keys.some((k) => k.includes(q))) {
        hits.push({ kind: 'section', actSlug: act.slug, number: s.number, title: `${act.shortName} ${s.number} — ${s.title}`, subtitle: act.title });
      }
    }
  }
  for (const g of pack.guides) {
    if (norm(`${g.title} ${g.summary}`).includes(q)) hits.push({ kind: 'guide', slug: g.slug, title: g.title, subtitle: g.summary });
  }
  for (const a of pack.articles) {
    if (norm(`${a.title} ${a.summary} ${a.tags.join(' ')}`).includes(q)) hits.push({ kind: 'article', slug: a.slug, title: a.title, subtitle: a.summary });
  }
  for (const t of pack.templates) {
    if (norm(`${t.title} ${t.summary}`).includes(q)) hits.push({ kind: 'template', slug: t.slug, title: t.title, subtitle: t.summary });
  }
  return hits.slice(0, limit);
}
