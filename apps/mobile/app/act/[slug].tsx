import { Stack, useLocalSearchParams } from 'expo-router';
import { Linking, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '@jfa/ui-tokens';
import { Body, Card, EmptyState, LegalDisclaimer, SampleBanner, Screen, SectionTitle } from '../../src/components/ui';
import { useContentLookup } from '../../src/content/content-context';

export default function ActScreen() {
  const { t } = useTranslation();
  const { slug, section } = useLocalSearchParams<{ slug: string; section?: string }>();
  const { act } = useContentLookup();
  const a = act(slug);
  if (!a) return <EmptyState text={t('app:library.noResults')} />;

  // When opened from search, show the matching section first.
  const sections = section ? [...a.sections].sort((x, y) => Number(y.number === section) - Number(x.number === section)) : a.sections;

  return (
    <Screen>
      <Stack.Screen options={{ title: a.shortName }} />
      <SampleBanner />
      <SectionTitle>{a.title}</SectionTitle>
      {a.summary ? <Body muted>{a.summary}</Body> : null}
      {a.sourceUrl ? (
        <Text accessibilityRole="link" style={{ color: colors.primary, fontSize: typography.body }} onPress={() => void Linking.openURL(a.sourceUrl!)}>
          {t('app:library.source')}: India Code
        </Text>
      ) : null}

      {sections.map((s) => (
        <Card key={s.number}>
          <Text style={{ fontSize: typography.bodyLarge, fontWeight: '700', color: colors.text }}>
            {t('app:library.section', { number: s.number })} — {s.title}
          </Text>
          {s.oldLawRefs.map((r) => (
            <Text key={`${r.act}-${r.section}`} style={{ fontSize: typography.caption, color: colors.textMuted }}>
              {t('app:library.oldLaw', { act: r.act, section: r.section })}
            </Text>
          ))}
          {s.plainExplanation ? (
            <>
              <Text style={{ fontSize: typography.body, fontWeight: '700', color: colors.text }}>{t('app:library.plainExplanation')}</Text>
              <Body>{s.plainExplanation}</Body>
            </>
          ) : null}
          <Body>{s.text}</Body>
        </Card>
      ))}

      <LegalDisclaimer />
    </Screen>
  );
}
