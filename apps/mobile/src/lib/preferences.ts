import { isLocale, type Locale } from '@jfa/shared';
import { storage as Storage } from './storage';

/**
 * Non-sensitive user preferences (on-device key-value store, see ./storage).
 * Never store personal data or tokens here — tokens go in expo-secure-store.
 */
const KEYS = { locale: 'pref.locale' } as const;

export function getSavedLocale(): Locale | undefined {
  try {
    const v = Storage.getItemSync(KEYS.locale);
    return isLocale(v) ? v : undefined;
  } catch {
    return undefined;
  }
}

/** Which guide steps the user ticked (indices). Not personal data — just reading progress. */
export function getGuideProgress(slug: string): number[] {
  try {
    const raw = Storage.getItemSync(`guide.progress.${slug}`);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

export function saveGuideProgress(slug: string, done: number[]) {
  try {
    Storage.setItemSync(`guide.progress.${slug}`, JSON.stringify(done));
  } catch {
    // progress is a convenience; ignore storage failures
  }
}

export function saveLocale(locale: Locale) {
  try {
    Storage.setItemSync(KEYS.locale, locale);
  } catch {
    // preference is a convenience; ignore storage failures
  }
}
