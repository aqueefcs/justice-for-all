import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, touchTarget, typography } from '@jfa/ui-tokens';
import { Heading, LegalDisclaimer, ListItem, SampleBanner, Screen, SectionTitle, Body, type IconName } from '../../src/components/ui';
import { useContentLookup } from '../../src/content/content-context';

export default function Home() {
  const { t } = useTranslation();
  const { pack, firstGuideOfType } = useContentLookup();
  const fir = firstGuideOfType('fir');
  const gd = firstGuideOfType('gd');

  const quick: { label: string; icon: IconName; href: Href }[] = [
    { label: t('app:home.fileFir'), icon: 'document-text', href: fir ? `/guide/${fir.slug}` : '/(tabs)/guides' },
    { label: t('app:home.fileGd'), icon: 'clipboard', href: gd ? `/guide/${gd.slug}` : '/(tabs)/guides' },
    { label: t('app:home.makeDraft'), icon: 'create', href: '/(tabs)/guides' },
  ];

  return (
    <Screen>
      <SampleBanner />
      <Heading>{t('app:home.greeting')}</Heading>
      <Body muted>{t('app:home.subtitle')}</Body>

      <Pressable accessibilityRole="search" onPress={() => router.push('/search')} style={styles.search}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <Text style={styles.searchText}>{t('app:home.searchPlaceholder')}</Text>
      </Pressable>

      <SectionTitle>{t('app:home.quickActions')}</SectionTitle>
      <View style={styles.quickRow}>
        {quick.map((q) => (
          <Pressable key={q.label} accessibilityRole="button" onPress={() => router.push(q.href)} style={styles.quick}>
            <Ionicons name={q.icon} size={28} color={colors.textOnDark} />
            <Text style={styles.quickText}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>{t('app:home.categories')}</SectionTitle>
      {pack.categories.map((c) => (
        <ListItem
          key={c.slug}
          title={c.title}
          subtitle={c.description}
          icon={c.icon as IconName}
          onPress={() => router.push(`/category/${c.slug}`)}
        />
      ))}

      <SectionTitle>{t('app:home.consultTitle')}</SectionTitle>
      <ListItem
        title={t('app:home.consultTitle')}
        subtitle={t('app:home.consultSubtitle')}
        icon="videocam"
        badge={t('comingSoon')}
        onPress={() => router.push('/coming-soon/consult')}
      />

      <LegalDisclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchText: { fontSize: typography.body, color: colors.textMuted },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quick: {
    flex: 1,
    minHeight: 96,
    backgroundColor: colors.navy800,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  quickText: { color: colors.textOnDark, fontSize: typography.caption, fontWeight: '700', textAlign: 'center' },
});
