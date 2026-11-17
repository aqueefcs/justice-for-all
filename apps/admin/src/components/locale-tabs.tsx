import type { ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { LOCALES, LOCALE_NATIVE_NAMES, type Locale } from '@jfa/shared';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { emptyTranslation, type Kind } from '@/lib/content-kinds';
import { useT } from './form-fields';

/**
 * One tab per supported language. English is required; other languages can be added or
 * removed. Languages come from LOCALES in @jfa/shared, so new ones appear automatically.
 */
export function LocaleTabs({ kind, disabled, children }: { kind: Kind; disabled?: boolean; children: (locale: Locale) => ReactNode }) {
  const t = useT();
  const { control, setValue, formState } = useFormContext();
  const translations = (useWatch({ control, name: 'translations' }) ?? {}) as Partial<Record<Locale, unknown>>;
  const hasError = (locale: Locale) => Boolean((formState.errors.translations as Record<string, unknown> | undefined)?.[locale]);

  return (
    <Tabs defaultValue="en" className="gap-4">
      <div className="flex items-center justify-between gap-3">
        <TabsList>
          {LOCALES.map((locale) => (
            <TabsTrigger key={locale} value={locale} className="gap-2">
              {LOCALE_NATIVE_NAMES[locale]}
              {!translations[locale] ? <span className="text-xs text-muted-foreground">·</span> : null}
              {hasError(locale) ? <span className="size-2 rounded-full bg-destructive" aria-label="has errors" /> : null}
            </TabsTrigger>
          ))}
        </TabsList>
        <p className="text-sm text-muted-foreground">{t('content.englishRequired')}</p>
      </div>
      {LOCALES.map((locale) => (
        <TabsContent key={locale} value={locale} className="flex flex-col gap-4">
          {translations[locale] ? (
            <>
              {children(locale)}
              {locale !== 'en' && !disabled ? (
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setValue(`translations.${locale}`, undefined, { shouldDirty: true })}
                  >
                    <Trash2 className="size-4" /> {t('content.removeTranslation', { lang: LOCALE_NATIVE_NAMES[locale] })}
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-6">
              <p className="text-muted-foreground">{t('content.translationMissing')}</p>
              {!disabled ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue(`translations.${locale}`, emptyTranslation(kind), { shouldDirty: true })}
                >
                  <Plus className="size-4" /> {t('content.addTranslation', { lang: LOCALE_NATIVE_NAMES[locale] })}
                </Button>
              ) : null}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
