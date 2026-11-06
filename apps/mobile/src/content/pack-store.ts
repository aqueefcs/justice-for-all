import Storage from 'expo-sqlite/kv-store';
import {
  ContentPackSchema,
  PackManifestSchema,
  SAMPLE_PACK_EN,
  type ContentPack,
  type Locale,
} from '@jfa/shared';
import { env } from '../lib/env';

/**
 * Offline-first content packs (ADR 0003).
 *  1. Read the cached pack for the locale from on-device SQLite (instant, works offline).
 *  2. Fall back to the cached English pack, then to the bundled SAMPLE pack.
 *  3. In the background, check `<CDN>/packs/manifest.json` and download newer packs.
 *
 * TODO(Phase 1): import packs into SQLite tables + an FTS5 index for fast search on large
 * packs (thousands of act sections). The in-memory search in `search.ts` is fine for the MVP.
 */
const cacheKey = (locale: Locale) => `pack.${locale}`;

export function loadCachedPack(locale: Locale): ContentPack {
  return readCached(locale) ?? readCached('en') ?? SAMPLE_PACK_EN;
}

function readCached(locale: Locale): ContentPack | undefined {
  try {
    const raw = Storage.getItemSync(cacheKey(locale));
    if (!raw) return undefined;
    const parsed = ContentPackSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

/** Downloads newer packs if the CDN is configured. Returns the updated pack for `locale`, if any. */
export async function syncPacks(locale: Locale): Promise<ContentPack | undefined> {
  if (!env.contentCdnUrl) return undefined;
  const res = await fetch(`${env.contentCdnUrl}/packs/manifest.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Manifest HTTP ${res.status}`);
  const manifest = PackManifestSchema.parse(await res.json());

  let updated: ContentPack | undefined;
  for (const entry of manifest.packs.filter((p) => p.locale === locale || p.locale === 'en')) {
    const current = readCached(entry.locale);
    if (current && current.version >= entry.version) continue;
    const packRes = await fetch(entry.url);
    if (!packRes.ok) continue;
    const pack = ContentPackSchema.parse(await packRes.json());
    // TODO: verify entry.sha256 against the downloaded bytes (expo-crypto) before caching.
    await Storage.setItem(cacheKey(entry.locale), JSON.stringify(pack));
    if (entry.locale === locale) updated = pack;
  }
  return updated;
}
