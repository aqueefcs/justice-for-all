import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Body, EmptyState, LegalDisclaimer, ListItem, SampleBanner, Screen, SectionTitle } from '../../src/components/ui';
import { useContentLookup } from '../../src/content/content-context';

export default function CategoryScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { pack, category } = useContentLookup();
  const cat = category(slug);
  const guides = pack.guides.filter((g) => g.categorySlug === slug);
  const templates = pack.templates.filter((tp) => tp.categorySlug === slug);
  const articles = pack.articles.filter((a) => a.categorySlug === slug);
  const empty = guides.length + templates.length + articles.length === 0;

  return (
    <Screen>
      <Stack.Screen options={{ title: cat?.title ?? '' }} />
      <SampleBanner />
      {cat?.description ? <Body muted>{cat.description}</Body> : null}
      {empty ? <EmptyState text={t('app:library.categoryEmpty')} /> : null}

      {guides.length > 0 ? <SectionTitle>{t('app:guides.title')}</SectionTitle> : null}
      {guides.map((g) => (
        <ListItem key={g.slug} title={g.title} subtitle={g.summary} icon="footsteps" onPress={() => router.push(`/guide/${g.slug}`)} />
      ))}

      {templates.length > 0 ? <SectionTitle>{t('app:templates.title')}</SectionTitle> : null}
      {templates.map((tp) => (
        <ListItem key={tp.slug} title={tp.title} subtitle={tp.summary} icon="document-attach" onPress={() => router.push(`/template/${tp.slug}`)} />
      ))}

      {articles.length > 0 ? <SectionTitle>{t('app:library.articles')}</SectionTitle> : null}
      {articles.map((a) => (
        <ListItem key={a.slug} title={a.title} subtitle={a.summary} icon="newspaper" onPress={() => router.push(`/article/${a.slug}`)} />
      ))}

      <LegalDisclaimer />
    </Screen>
  );
}
