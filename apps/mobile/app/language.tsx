import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LOCALES, LOCALE_NATIVE_NAMES } from '@jfa/shared';
import { ListItem, Screen } from '../src/components/ui';
import { changeLanguage, currentLocale } from '../src/lib/i18n';

export default function Language() {
  const { t } = useTranslation();
  const selected = currentLocale();
  return (
    <Screen>
      <Stack.Screen options={{ title: t('app:more.language') }} />
      {LOCALES.map((locale) => (
        <ListItem
          key={locale}
          title={LOCALE_NATIVE_NAMES[locale]}
          icon={locale === selected ? 'checkmark-circle' : 'ellipse-outline'}
          onPress={() => {
            void changeLanguage(locale);
            router.back();
          }}
        />
      ))}
    </Screen>
  );
}
