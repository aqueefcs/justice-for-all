import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { isLocale, type ContentPack, type Locale } from '@jfa/shared';
import { loadCachedPack, syncPacks } from './pack-store';

const ContentContext = createContext<ContentPack | null>(null);

/** Provides the content pack for the current UI language and refreshes it in the background. */
export function ContentProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const locale: Locale = isLocale(i18n.language) ? i18n.language : 'en';
  // A freshly synced pack wins; otherwise read the cached/bundled pack for this locale.
  const [synced, setSynced] = useState<ContentPack | undefined>();
  const pack = useMemo(
    () => (synced && synced.locale === locale ? synced : loadCachedPack(locale)),
    [synced, locale],
  );

  useEffect(() => {
    let cancelled = false;
    syncPacks(locale)
      .then((updated) => {
        if (updated && !cancelled) setSynced(updated);
      })
      .catch(() => {
        // Offline or CDN not reachable — keep the cached pack.
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return <ContentContext.Provider value={pack}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentPack {
  const pack = useContext(ContentContext);
  if (!pack) throw new Error('useContent must be used inside <ContentProvider>');
  return pack;
}

/** Convenience lookups. */
export function useContentLookup() {
  const pack = useContent();
  return useMemo(
    () => ({
      pack,
      category: (slug: string) => pack.categories.find((c) => c.slug === slug),
      act: (slug: string) => pack.acts.find((a) => a.slug === slug),
      article: (slug: string) => pack.articles.find((a) => a.slug === slug),
      guide: (slug: string) => pack.guides.find((g) => g.slug === slug),
      template: (slug: string) => pack.templates.find((t) => t.slug === slug),
      firstGuideOfType: (type: string) => pack.guides.find((g) => g.type === type),
    }),
    [pack],
  );
}
