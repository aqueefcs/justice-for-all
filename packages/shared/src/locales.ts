import { z } from 'zod';

/**
 * Supported locales (BCP-47). `en` is complete; `hi` is scaffolded.
 * Add regional languages here first, then add `packages/i18n/locales/<code>/`.
 */
export const LOCALES = ['en', 'hi'] as const;
export const LocaleSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof LocaleSchema>;
export const DEFAULT_LOCALE: Locale = 'en';

/** Native names, shown in the language picker (deliberately not translated). */
export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
};

export function isLocale(value: unknown): value is Locale {
  return LocaleSchema.safeParse(value).success;
}
