import { useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radius, spacing } from '@jfa/ui-tokens';
import { Chip, EmptyState, Glass, LegalDisclaimer, Row, SampleBanner, Screen, TopBar, Txt } from '../../src/components/ui';
import { useContentLookup } from '../../src/content/content-context';

export default function ActScreen() {
  const { t } = useTranslation();
  const { slug, section } = useLocalSearchParams<{ slug: string; section?: string }>();
  const { act } = useContentLookup();
  const a = act(slug);

  if (!a) {
    return (
      <Screen topBar={<TopBar />}>
        <EmptyState text={t('app:library.noResults')} />
      </Screen>
    );
  }

  // When opened from search, show the matching section first.
  const sections = section ? [...a.sections].sort((x, y) => Number(y.number === section) - Number(x.number === section)) : a.sections;

  return (
    <Screen topBar={<TopBar title={t('app:library.title')} />}>
      <Txt variant="eyebrow">{a.shortName} · {a.year}</Txt>
      <Txt variant="h1">{a.title}</Txt>
      {a.summary ? <Txt variant="muted">{a.summary}</Txt> : null}
      <Row gap={spacing.sm} style={{ flexWrap: 'wrap' }}>
        <Chip label={t('app:library.sectionCount', { count: a.sections.length })} />
        {a.sourceUrl ? (
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(a.sourceUrl!)} hitSlop={8}>
            <Chip label={`${t('app:library.source')}: India Code`} tone="accent" />
          </Pressable>
        ) : null}
      </Row>
      <SampleBanner />

      {sections.map((s) => (
        <Glass key={s.number} tone={s.number === section ? 'accent' : 'default'} style={styles.card}>
          <Row style={{ alignItems: 'flex-start' }}>
            <View style={styles.number}>
              <Text style={styles.numberText}>{s.number}</Text>
            </View>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Txt variant="h3">{s.title}</Txt>
              {s.oldLawRefs.map((r) => (
                <Row key={`${r.act}-${r.section}`} gap={spacing.xs}>
                  <Ionicons name="git-compare-outline" size={16} color={colors.accentText} />
                  <Txt variant="label">{t('app:library.oldLaw', { act: r.act, section: r.section })}</Txt>
                </Row>
              ))}
            </View>
          </Row>
          {s.plainExplanation ? (
            <View style={styles.plain}>
              <Txt variant="eyebrow">{t('app:library.plainExplanation')}</Txt>
              <Txt>{s.plainExplanation}</Txt>
            </View>
          ) : null}
          <Txt variant="muted">{s.text}</Txt>
        </Glass>
      ))}

      <LegalDisclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.md },
  number: { minWidth: 52, height: 40, paddingHorizontal: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.accentText },
  plain: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
});
