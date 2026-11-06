import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@jfa/ui-tokens';
import { Body, Card, EmptyState, Heading, LegalDisclaimer, ListItem, SampleBanner, Screen, SectionTitle } from '../../src/components/ui';
import { ReadAloud } from '../../src/components/read-aloud';
import { useContentLookup } from '../../src/content/content-context';

export default function GuideScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { guide, template } = useContentLookup();
  const g = guide(slug);
  if (!g) return <EmptyState text={t('app:library.noResults')} />;
  const templates = g.templateSlugs.map(template).filter((x) => x !== undefined);
  const speech = [g.title, ...g.steps.map((s, i) => `${t('app:guides.stepN', { n: i + 1 })}. ${s.title}. ${s.body}`)].join('. ');

  return (
    <Screen>
      <Stack.Screen options={{ title: t(`app:guides.type.${g.type}`) }} />
      <SampleBanner />
      <Heading>{g.title}</Heading>
      <Body muted>{g.summary}</Body>
      <ReadAloud text={speech} label={t('readAloud')} />

      <SectionTitle>{t('app:guides.steps')}</SectionTitle>
      {g.steps.map((step, i) => (
        <View key={i} style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{i + 1}</Text>
          </View>
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Body>{step.body}</Body>
          </View>
        </View>
      ))}

      {g.checklist.length > 0 ? (
        <>
          <SectionTitle>{t('app:guides.checklist')}</SectionTitle>
          <Card>
            {g.checklist.map((item, i) => (
              <Body key={i}>☐ {item}</Body>
            ))}
          </Card>
        </>
      ) : null}

      {templates.length > 0 ? (
        <>
          <SectionTitle>{t('app:guides.relatedTemplates')}</SectionTitle>
          {templates.map((tp) => (
            <ListItem key={tp.slug} title={tp.title} subtitle={tp.summary} icon="document-attach" onPress={() => router.push(`/template/${tp.slug}`)} />
          ))}
        </>
      ) : null}

      {g.externalLinks.length > 0 ? (
        <>
          <SectionTitle>{t('app:guides.links')}</SectionTitle>
          {g.externalLinks.map((l) => (
            <ListItem key={l.url} title={l.label} subtitle={l.state} icon="open-outline" onPress={() => void Linking.openURL(l.url)} />
          ))}
        </>
      ) : null}

      <LegalDisclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: colors.textOnDark, fontWeight: '700', fontSize: typography.body },
  stepBody: { flex: 1, gap: spacing.xs },
  stepTitle: { fontSize: typography.body, fontWeight: '700', color: colors.text },
});
