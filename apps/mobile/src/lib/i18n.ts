import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { resources, DEFAULT_NS } from '@jfa/i18n';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@jfa/shared';
import { getSavedLocale, saveLocale } from './preferences';

function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return isLocale(code) ? code : DEFAULT_LOCALE;
}

/** Dedicated instance, registered with react-i18next so `useTranslation()` uses it. */
const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: getSavedLocale() ?? deviceLocale(),
  fallbackLng: DEFAULT_LOCALE,
  ns: ['common', 'app'],
  defaultNS: DEFAULT_NS,
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

export function changeLanguage(locale: Locale) {
  saveLocale(locale);
  return i18n.changeLanguage(locale);
}

export function currentLocale(): Locale {
  return isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;
}

export { i18n };
