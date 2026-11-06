import { useMemo, useState } from 'react';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState, Field, ListItem, Screen } from '../src/components/ui';
import { useContent } from '../src/content/content-context';
import { searchPack, type SearchHit } from '../src/content/search';

const ICONS = { section: 'book', guide: 'footsteps', article: 'newspaper', template: 'document-attach' } as const;

function open(hit: SearchHit) {
  switch (hit.kind) {
    case 'section':
      return router.push({ pathname: '/act/[slug]', params: { slug: hit.actSlug, section: hit.number } });
    case 'guide':
      return router.push(`/guide/${hit.slug}`);
    case 'article':
      return router.push(`/article/${hit.slug}`);
    case 'template':
      return router.push(`/template/${hit.slug}`);
  }
}

export default function Search() {
  const { t } = useTranslation();
  const pack = useContent();
  const [query, setQuery] = useState('');
  const hits = useMemo(() => searchPack(pack, query), [pack, query]);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('search') }} />
      <Field
        label={t('search')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('app:home.searchPlaceholder')}
        autoFocus
        returnKeyType="search"
        autoCorrect={false}
      />
      {query.trim().length >= 2 && hits.length === 0 ? <EmptyState text={t('app:library.noResults')} /> : null}
      {hits.map((hit, i) => (
        <ListItem key={`${hit.kind}-${i}`} title={hit.title} subtitle={hit.subtitle} icon={ICONS[hit.kind]} onPress={() => open(hit)} />
      ))}
    </Screen>
  );
}
