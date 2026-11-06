import enCommon from '../locales/en/common.json';
import enApp from '../locales/en/app.json';
import enAdmin from '../locales/en/admin.json';
import hiCommon from '../locales/hi/common.json';
import hiApp from '../locales/hi/app.json';
import hiAdmin from '../locales/hi/admin.json';

export const NAMESPACES = ['common', 'app', 'admin'] as const;
export type Namespace = (typeof NAMESPACES)[number];

/** i18next `resources` object. English is the source of truth for keys. */
export const resources = {
  en: { common: enCommon, app: enApp, admin: enAdmin },
  hi: { common: hiCommon, app: hiApp, admin: hiAdmin },
} as const;

export type Resources = (typeof resources)['en'];
export const DEFAULT_NS: Namespace = 'common';
