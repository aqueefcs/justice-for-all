import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  LegalDisclaimer,
  ListItem,
  SampleBanner,
  Screen,
  SearchBar,
  Section,
  Segmented,
  Txt,
  type IconName,
} from '../../src/components/ui';
import { useContent } from '../../src/content/content-context';

type LearnTab = 'laws' | 'guides' | 'drafts';
const isTab = (v: unknown): v is LearnTab => v === 'laws' || v === 'guides' || v === 'drafts';

/** Learn = law library + step-by-step guides + drafting templates, behind one segmented control. */
export default function Learn() {
  const { t } = useTranslation();
  const pack = useContent();
  const params = useLocalSearchParams<{ tab?: string }>();
  // The URL param (deep links from Home: "Know your rights", "Draft a document") selects the tab;
  // tapping the segmented control updates the param, so back/forward stay consistent.
  const tab: LearnTab = isTab(params.tab) ? params.tab : 'guides';
  const setTab = (next: LearnTab) => router.setParams({ tab: next });

  return (
    <Screen>
      <Txt variant="h1" style={{ marginTop: 8 }}>
        {t('app:learn.title')}
      </Txt>
      <Txt variant="muted">{t('app:learn.subtitle')}</Txt>
      <SearchBar placeholder={t('app:home.searchPlaceholder')} onPress={() => router.push('/search')} />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'laws', label: t('app:learn.tabs.laws') },
          { value: 'guides', label: t('app:learn.tabs.guides') },
          { value: 'drafts', label: t('app:learn.tabs.drafts') },
        ]}
      />
      <SampleBanner />

      {tab === 'laws' ? (
        <>
          <Section title={t('app:library.acts')}>
            {pack.acts.length === 0 ? <EmptyState text={t('app:library.categoryEmpty')} /> : null}
            {pack.acts.map((a) => (
              <ListItem
                key={a.slug}
                icon="book-outline"
                title={a.title}
                subtitle={`${a.shortName} · ${t('app:library.sectionCount', { count: a.sections.length })}`}
                onPress={() => router.push(`/act/${a.slug}`)}
              />
            ))}
          </Section>
          {pack.articles.length > 0 ? (
            <Section title={t('app:library.articles')}>
              {pack.articles.map((a) => (
                <ListItem key={a.slug} icon="newspaper-outline" title={a.title} subtitle={a.summary} onPress={() => router.push(`/article/${a.slug}`)} />
              ))}
            </Section>
          ) : null}
          <Section title={t('app:learn.topics')}>
            {pack.categories.map((c) => (
              <ListItem key={c.slug} icon={c.icon as IconName} title={c.title} subtitle={c.description} onPress={() => router.push(`/category/${c.slug}`)} />
            ))}
          </Section>
        </>
      ) : null}

      {tab === 'guides' ? (
        <Section title={t('app:guides.title')}>
          {pack.guides.map((g) => (
            <ListItem
              key={g.slug}
              icon="footsteps-outline"
              title={g.title}
              subtitle={`${t(`app:guides.type.${g.type}`)} · ${t('app:guides.stepN', { n: g.steps.length })}`}
              onPress={() => router.push(`/guide/${g.slug}`)}
            />
          ))}
        </Section>
      ) : null}

      {tab === 'drafts' ? (
        <Section title={t('app:templates.title')}>
          {pack.templates.map((tp) => (
            <ListItem
              key={tp.slug}
              icon="document-text-outline"
              title={tp.title}
              subtitle={t('app:templates.printReady')}
              onPress={() => router.push(`/template/${tp.slug}`)}
            />
          ))}
        </Section>
      ) : null}

      <LegalDisclaimer />
    </Screen>
  );
}
