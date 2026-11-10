import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  IconBadge,
  LegalDisclaimer,
  ListItem,
  SampleBanner,
  Screen,
  Section,
  TopBar,
  Txt,
  type IconName,
} from '../../src/components/ui';
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
    <Screen topBar={<TopBar title={t('app:learn.topics')} />}>
      {cat ? <IconBadge icon={cat.icon as IconName} size={56} /> : null}
      <Txt variant="h1">{cat?.title ?? ''}</Txt>
      {cat?.description ? <Txt variant="muted">{cat.description}</Txt> : null}
      <SampleBanner />
      {empty ? <EmptyState text={t('app:library.categoryEmpty')} /> : null}

      {guides.length > 0 ? (
        <Section title={t('app:guides.title')}>
          {guides.map((g) => (
            <ListItem key={g.slug} icon="footsteps-outline" title={g.title} subtitle={g.summary} onPress={() => router.push(`/guide/${g.slug}`)} />
          ))}
        </Section>
      ) : null}

      {templates.length > 0 ? (
        <Section title={t('app:templates.title')}>
          {templates.map((tp) => (
            <ListItem key={tp.slug} icon="document-text-outline" title={tp.title} subtitle={t('app:templates.printReady')} onPress={() => router.push(`/template/${tp.slug}`)} />
          ))}
        </Section>
      ) : null}

      {articles.length > 0 ? (
        <Section title={t('app:library.articles')}>
          {articles.map((a) => (
            <ListItem key={a.slug} icon="newspaper-outline" title={a.title} subtitle={a.summary} onPress={() => router.push(`/article/${a.slug}`)} />
          ))}
        </Section>
      ) : null}

      <LegalDisclaimer />
    </Screen>
  );
}
