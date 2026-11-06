import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LOCALE_NATIVE_NAMES } from '@jfa/shared';
import { Body, ListItem, Screen, SectionTitle } from '../../src/components/ui';
import { currentLocale } from '../../src/lib/i18n';

export default function More() {
  const { t } = useTranslation();

  return (
    <Screen>
      <SectionTitle>{t('app:more.language')}</SectionTitle>
      <ListItem title={t('app:more.language')} subtitle={LOCALE_NATIVE_NAMES[currentLocale()]} icon="language" onPress={() => router.push('/language')} />

      <SectionTitle>{t('app:more.services')}</SectionTitle>
      <ListItem title={t('app:comingSoon.consult.title')} icon="videocam" badge={t('comingSoon')} onPress={() => router.push('/coming-soon/consult')} />
      <ListItem title={t('app:comingSoon.documents.title')} icon="folder-open" badge={t('comingSoon')} onPress={() => router.push('/coming-soon/documents')} />

      <SectionTitle>{t('app:more.account')}</SectionTitle>
      <ListItem title={t('app:comingSoon.profile.title')} icon="person-circle" badge={t('comingSoon')} onPress={() => router.push('/coming-soon/profile')} />
      <ListItem title={t('app:comingSoon.lawyer.title')} icon="briefcase" badge={t('comingSoon')} onPress={() => router.push('/coming-soon/lawyer')} />

      <SectionTitle>{t('app:more.about')}</SectionTitle>
      {/* TODO: link to the published privacy policy, terms and grievance officer details (docs/compliance.md) */}
      <ListItem title={t('app:more.privacy')} icon="shield-checkmark" badge={t('comingSoon')} onPress={() => router.push('/coming-soon/profile')} />
      <ListItem title={t('app:more.terms')} icon="document-text" badge={t('comingSoon')} onPress={() => router.push('/coming-soon/profile')} />
      <ListItem title={t('app:more.grievance')} icon="mail" badge={t('comingSoon')} onPress={() => router.push('/coming-soon/profile')} />
      <Body muted>{t('app:more.version', { version: Constants.expoConfig?.version ?? '0.0.0' })}</Body>
    </Screen>
  );
}
