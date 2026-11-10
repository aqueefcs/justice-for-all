import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, iconSize, radius, spacing, typography } from '@jfa/ui-tokens';
import { EmptyState, ListItem, Screen, TopBar } from '../src/components/ui';
import { useContent } from '../src/content/content-context';
import { searchPack, type SearchHit } from '../src/content/search';

const ICONS = { section: 'book-outline', guide: 'footsteps-outline', article: 'newspaper-outline', template: 'document-text-outline' } as const;

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
    <Screen topBar={<TopBar title={t('search')} />}>
      <View style={styles.field}>
        <Ionicons name="search" size={iconSize.md} color={colors.accentText} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('app:home.searchPlaceholder')}
          placeholderTextColor={colors.textSubtle}
          selectionColor={colors.accent}
          accessibilityLabel={t('search')}
          autoFocus
          returnKeyType="search"
          autoCorrect={false}
          style={styles.input}
        />
      </View>
      {query.trim().length >= 2 && hits.length === 0 ? <EmptyState text={t('app:library.noResults')} /> : null}
      {hits.map((hit, i) => (
        <ListItem key={`${hit.kind}-${i}`} title={hit.title} subtitle={hit.subtitle} icon={ICONS[hit.kind]} onPress={() => open(hit)} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    boxShadow: `0 0 0 4px ${colors.accentSoft}`,
  },
  input: { flex: 1, minHeight: 56, fontFamily: fonts.body, fontSize: typography.bodyLarge, color: colors.text },
});
