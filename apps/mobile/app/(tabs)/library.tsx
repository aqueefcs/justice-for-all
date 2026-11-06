import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState, LegalDisclaimer, ListItem, SampleBanner, Screen, SectionTitle } from '../../src/components/ui';
import { useContent } from '../../src/content/content-context';

export default function Library() {
  const { t } = useTranslation();
  const pack = useContent();

  return (
    <Screen>
      <SampleBanner />
      <ListItem title={t('app:library.searchPlaceholder')} icon="search" onPress={() => router.push('/search')} />

      <SectionTitle>{t('app:library.acts')}</SectionTitle>
      {pack.acts.length === 0 ? <EmptyState text={t('app:library.categoryEmpty')} /> : null}
      {pack.acts.map((a) => (
        <ListItem
          key={a.slug}
          title={a.title}
          subtitle={`${a.shortName} · ${t('app:library.sectionCount', { count: a.sections.length })}`}
          icon="book"
          onPress={() => router.push(`/act/${a.slug}`)}
        />
      ))}

      <SectionTitle>{t('app:library.articles')}</SectionTitle>
      {pack.articles.map((a) => (
        <ListItem key={a.slug} title={a.title} subtitle={a.summary} icon="newspaper" onPress={() => router.push(`/article/${a.slug}`)} />
      ))}

      <LegalDisclaimer />
    </Screen>
  );
}
