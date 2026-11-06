// Fails CI when a locale is missing keys that exist in English (or has extra keys).
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'locales');
const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

const locales = readdirSync(root);
let failed = false;
for (const file of readdirSync(join(root, 'en'))) {
  const enKeys = new Set(flatten(JSON.parse(readFileSync(join(root, 'en', file), 'utf8'))));
  for (const locale of locales.filter((l) => l !== 'en')) {
    let keys;
    try {
      keys = new Set(flatten(JSON.parse(readFileSync(join(root, locale, file), 'utf8'))));
    } catch {
      console.error(`✗ ${locale}/${file} is missing`);
      failed = true;
      continue;
    }
    const missing = [...enKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !enKeys.has(k));
    if (missing.length || extra.length) {
      failed = true;
      if (missing.length) console.error(`✗ ${locale}/${file} missing: ${missing.join(', ')}`);
      if (extra.length) console.error(`✗ ${locale}/${file} extra: ${extra.join(', ')}`);
    }
  }
}
if (failed) process.exit(1);
console.log('✓ i18n keys are in sync');
