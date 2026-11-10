import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, LegalDisclaimer, SampleBanner, Screen, TopBar, Txt } from '../../src/components/ui';
import { ReadAloud } from '../../src/components/read-aloud';
import { useContentLookup } from '../../src/content/content-context';

/**
 * Article bodies are sanitized HTML from the CMS. MVP renders them as plain paragraphs.
 * TODO(Phase 1): render rich text (headings, lists, links) with a lightweight HTML renderer.
 */
function htmlToParagraphs(html: string): string[] {
  return html
    .replace(/<\/(p|h\d|li|div)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ArticleScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { article, category } = useContentLookup();
  const a = article(slug);

  if (!a) {
    return (
      <Screen topBar={<TopBar />}>
        <EmptyState text={t('app:library.noResults')} />
      </Screen>
    );
  }
  const paragraphs = htmlToParagraphs(a.body);

  return (
    <Screen
      topBar={<TopBar title={category(a.categorySlug)?.title ?? t('app:library.articles')} />}
      dock={
        <>
          <ReadAloud text={[a.title, ...paragraphs].join('. ')} />
          <Button icon="videocam" label={t('app:guides.getHelp')} onPress={() => router.push('/coming-soon/consult')} />
        </>
      }
    >
      <Txt variant="eyebrow">{t('app:library.articles')}</Txt>
      <Txt variant="h1">{a.title}</Txt>
      <Txt variant="muted">{a.summary}</Txt>
      <SampleBanner />
      {paragraphs.map((p, i) => (
        <Txt key={i} style={{ fontSize: 17, lineHeight: 27 }}>
          {p}
        </Txt>
      ))}
      <LegalDisclaimer />
    </Screen>
  );
}
