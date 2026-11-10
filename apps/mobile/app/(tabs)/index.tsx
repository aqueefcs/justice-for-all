import { router, type Href } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { LOCALE_NATIVE_NAMES } from '@jfa/shared';
import { colors, fonts, radius, spacing } from '@jfa/ui-tokens';
import { Logo } from '../../src/components/logo';
import {
  Button,
  LegalDisclaimer,
  ListItem,
  Row,
  SampleBanner,
  Screen,
  SearchBar,
  Section,
  Tile,
  Txt,
  type IconName,
} from '../../src/components/ui';
import { useContentLookup } from '../../src/content/content-context';
import { currentLocale } from '../../src/lib/i18n';

/** National helplines (India). Tapping opens the phone dialer. */
const EMERGENCY = [
  { number: '112', key: 'all' },
  { number: '181', key: 'women' },
  { number: '1930', key: 'cyber' },
  { number: '15100', key: 'legalAid' },
] as const;

export default function Home() {
  const { t } = useTranslation();
  const { firstGuideOfType, guide } = useContentLookup();
  const fir = firstGuideOfType('fir');
  const gd = firstGuideOfType('gd');
  const guideHref = (slug?: string): Href => (slug && guide(slug) ? `/guide/${slug}` : '/(tabs)/learn');

  const tiles: { key: string; icon: IconName; href: Href; hot?: boolean; soon?: boolean }[] = [
    { key: 'fir', icon: 'shield-checkmark-outline', href: guideHref(fir?.slug) },
    { key: 'gd', icon: 'journal-outline', href: guideHref(gd?.slug) },
    { key: 'draft', icon: 'create-outline', href: { pathname: '/(tabs)/learn', params: { tab: 'drafts' } } },
    { key: 'rights', icon: 'library-outline', href: { pathname: '/(tabs)/learn', params: { tab: 'laws' } } },
    { key: 'lawyer', icon: 'videocam', href: '/coming-soon/consult', hot: true, soon: true },
    { key: 'ask', icon: 'sparkles-outline', href: '/(tabs)/ask', soon: true },
  ];

  // UI shortcuts into existing content (not legal content themselves).
  const situations: { key: string; href: Href }[] = [
    { key: 'police', href: guideHref(fir?.slug) },
    { key: 'landlord', href: '/category/property' },
    { key: 'wages', href: '/category/work' },
    { key: 'family', href: '/category/family' },
    { key: 'lostDocs', href: guideHref(gd?.slug) },
  ];

  return (
    <Screen>
      {/* Header */}
      <Row style={{ marginTop: spacing.sm }}>
        <Logo size={44} />
        <View style={{ flex: 1 }}>
          <Txt variant="label">{t('app:home.greeting')}</Txt>
          <Txt variant="bodyStrong">{t('appName')}</Txt>
        </View>
        <Pressable
          onPress={() => router.push('/language')}
          accessibilityRole="button"
          accessibilityLabel={`${t('app:more.language')}: ${LOCALE_NATIVE_NAMES[currentLocale()]}`}
          style={({ pressed }) => [styles.langButton, pressed && { backgroundColor: colors.surfacePressed }]}
        >
          <Ionicons name="language" size={18} color={colors.accentText} />
          <Text style={styles.langText}>{currentLocale().toUpperCase()}</Text>
        </Pressable>
      </Row>

      {/* Hero */}
      <View style={{ marginTop: spacing.md }}>
        <Txt variant="h1">{t('app:home.heroLine1')}</Txt>
        <Txt variant="h1" accent>
          {t('app:home.heroLine2')}
        </Txt>
      </View>
      <SearchBar placeholder={t('app:home.searchPlaceholder')} onPress={() => router.push('/search')} />
      <SampleBanner />

      {/* Services grid */}
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <Tile
            key={tile.key}
            icon={tile.icon}
            hot={tile.hot}
            title={t(`app:home.tiles.${tile.key}.title`)}
            subtitle={t(`app:home.tiles.${tile.key}.sub`)}
            badge={tile.soon ? t('comingSoon') : undefined}
            onPress={() => router.push(tile.href)}
          />
        ))}
      </View>

      {/* Start from what happened */}
      <Section title={t('app:home.happenedTitle')}>
        <Txt variant="muted">{t('app:home.happenedSub')}</Txt>
        {situations.map((s) => (
          <ListItem key={s.key} title={t(`app:home.situations.${s.key}`)} trailingIcon="arrow-forward" onPress={() => router.push(s.href)} />
        ))}
      </Section>

      {/* Emergency numbers */}
      <Section title={t('app:home.emergencyTitle')}>
        <View style={styles.emergencyRow}>
          {EMERGENCY.map((e) => {
            const label = t(`app:home.emergency.${e.key}`);
            return (
              <Pressable
                key={e.number}
                onPress={() => void Linking.openURL(`tel:${e.number}`)}
                accessibilityRole="button"
                accessibilityLabel={t('app:home.callA11y', { number: e.number, label })}
                style={({ pressed }) => [styles.emergency, pressed && { backgroundColor: colors.surfacePressed }]}
              >
                <Row gap={spacing.xs}>
                  <Ionicons name="call" size={14} color={colors.accentText} />
                  <Text style={styles.emergencyNumber}>{e.number}</Text>
                </Row>
                <Txt variant="label" numberOfLines={2}>
                  {label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Button
        variant="secondary"
        icon="library-outline"
        label={t('app:home.browseLibrary')}
        onPress={() => router.push({ pathname: '/(tabs)/learn', params: { tab: 'laws' } })}
        style={{ marginTop: spacing.lg }}
      />
      <LegalDisclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  langButton: {
    minHeight: 48,
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  langText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  emergencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  emergency: {
    flexBasis: '22%',
    flexGrow: 1,
    minHeight: 76,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  emergencyNumber: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text },
});
