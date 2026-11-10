import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LOCALES, LOCALE_NATIVE_NAMES } from '@jfa/shared';
import { ListItem, Screen, TopBar, Txt } from '../src/components/ui';
import { changeLanguage, currentLocale } from '../src/lib/i18n';

export default function Language() {
  const { t } = useTranslation();
  const selected = currentLocale();
  return (
    <Screen topBar={<TopBar title={t('app:more.title')} />}>
      <Txt variant="h1">{t('app:more.language')}</Txt>
      <Txt variant="muted">{t('app:onboarding.changeLater')}</Txt>
      {LOCALES.map((locale) => (
        <ListItem
          key={locale}
          title={LOCALE_NATIVE_NAMES[locale]}
          icon="language"
          trailingIcon={locale === selected ? 'checkmark-circle' : 'ellipse-outline'}
          onPress={() => {
            void changeLanguage(locale);
            router.back();
          }}
        />
      ))}
    </Screen>
  );
}
