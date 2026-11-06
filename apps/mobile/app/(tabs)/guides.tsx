import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LegalDisclaimer, ListItem, SampleBanner, Screen, SectionTitle } from '../../src/components/ui';
import { useContent } from '../../src/content/content-context';

export default function Guides() {
  const { t } = useTranslation();
  const pack = useContent();

  return (
    <Screen>
      <SampleBanner />
      <SectionTitle>{t('app:guides.title')}</SectionTitle>
      {pack.guides.map((g) => (
        <ListItem
          key={g.slug}
          title={g.title}
          subtitle={`${t(`app:guides.type.${g.type}`)} · ${g.summary}`}
          icon="footsteps"
          onPress={() => router.push(`/guide/${g.slug}`)}
        />
      ))}

      <SectionTitle>{t('app:templates.title')}</SectionTitle>
      {pack.templates.map((tp) => (
        <ListItem key={tp.slug} title={tp.title} subtitle={tp.summary} icon="document-attach" onPress={() => router.push(`/template/${tp.slug}`)} />
      ))}

      <LegalDisclaimer />
    </Screen>
  );
}
