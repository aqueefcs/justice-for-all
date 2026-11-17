import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from '@jfa/i18n';

/** Admin console strings live in packages/i18n/locales/<lang>/admin.json (English for now). */
const i18n = createInstance();
void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  ns: ['admin', 'common'],
  defaultNS: 'admin',
  interpolation: { escapeValue: false },
});

export { i18n };
