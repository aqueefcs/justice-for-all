import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LOCALE_NATIVE_NAMES } from '@jfa/shared';
import { Glass, ListItem, Screen, Section, Txt, Divider } from '../../src/components/ui';
import { currentLocale } from '../../src/lib/i18n';

export default function Me() {
  const { t } = useTranslation();
  const soon = t('comingSoon');

  return (
    <Screen>
      <Txt variant="h1" style={{ marginTop: 8 }}>
        {t('app:more.title')}
      </Txt>

      <Section title={t('app:more.language')}>
        <ListItem icon="language" title={t('app:more.language')} subtitle={LOCALE_NATIVE_NAMES[currentLocale()]} onPress={() => router.push('/language')} />
      </Section>

      <Section title={t('app:more.services')}>
        <ListItem icon="videocam-outline" title={t('app:comingSoon.consult.title')} badge={soon} onPress={() => router.push('/coming-soon/consult')} />
        <ListItem icon="folder-open-outline" title={t('app:comingSoon.documents.title')} badge={soon} onPress={() => router.push('/coming-soon/documents')} />
      </Section>

      <Section title={t('app:more.account')}>
        <ListItem icon="person-circle-outline" title={t('app:comingSoon.profile.title')} badge={soon} onPress={() => router.push('/coming-soon/profile')} />
        <ListItem icon="briefcase-outline" title={t('app:comingSoon.lawyer.title')} badge={soon} onPress={() => router.push('/coming-soon/lawyer')} />
      </Section>

      <Section title={t('app:more.about')}>
        {/* TODO: link to the published privacy policy, terms and grievance officer details (docs/compliance.md) */}
        <Glass style={{ paddingHorizontal: 4 }}>
          <ListItem card={false} icon="shield-checkmark-outline" title={t('app:more.privacy')} badge={soon} onPress={() => router.push('/coming-soon/profile')} />
          <Divider />
          <ListItem card={false} icon="document-text-outline" title={t('app:more.terms')} badge={soon} onPress={() => router.push('/coming-soon/profile')} />
          <Divider />
          <ListItem card={false} icon="mail-outline" title={t('app:more.grievance')} badge={soon} onPress={() => router.push('/coming-soon/profile')} />
        </Glass>
      </Section>

      <Txt variant="label" style={{ textAlign: 'center', marginTop: 16 }}>
        {t('app:more.version', { version: Constants.expoConfig?.version ?? '0.0.0' })}
      </Txt>
    </Screen>
  );
}
