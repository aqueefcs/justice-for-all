import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Body, EmptyState, Heading, LegalDisclaimer, SampleBanner, Screen } from '../../src/components/ui';
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
  const { article } = useContentLookup();
  const a = article(slug);
  if (!a) return <EmptyState text={t('app:library.noResults')} />;
  const paragraphs = htmlToParagraphs(a.body);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('app:library.articles') }} />
      <SampleBanner />
      <Heading>{a.title}</Heading>
      <Body muted>{a.summary}</Body>
      <ReadAloud text={[a.title, ...paragraphs].join('. ')} label={t('readAloud')} />
      {paragraphs.map((p, i) => (
        <Body key={i}>{p}</Body>
      ))}
      <LegalDisclaimer />
    </Screen>
  );
}
