import Storage from 'expo-sqlite/kv-store';
import { isLocale, type Locale } from '@jfa/shared';

/**
 * Non-sensitive user preferences (on-device SQLite key-value store).
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

export function saveLocale(locale: Locale) {
  try {
    Storage.setItemSync(KEYS.locale, locale);
  } catch {
    // preference is a convenience; ignore storage failures
  }
}
