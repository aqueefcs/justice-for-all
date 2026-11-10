import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radius, spacing } from '@jfa/ui-tokens';
import {
  Button,
  Chip,
  EmptyState,
  Glass,
  LegalDisclaimer,
  ListItem,
  ProgressBars,
  Row,
  Screen,
  Section,
  TopBar,
  Txt,
} from '../../src/components/ui';
import { ReadAloud } from '../../src/components/read-aloud';
import { useContentLookup } from '../../src/content/content-context';
import { getGuideProgress, saveGuideProgress } from '../../src/lib/preferences';

/** Step-by-step guide: tick steps as you go; progress is saved on this phone. */
export default function GuideScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { guide, template, pack, category } = useContentLookup();
  const g = guide(slug);
  const [done, setDone] = useState<number[]>(() => getGuideProgress(slug));

  if (!g) {
    return (
      <Screen topBar={<TopBar />}>
        <EmptyState text={t('app:library.noResults')} />
      </Screen>
    );
  }

  const toggle = (i: number) => {
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i].sort((a, b) => a - b);
    setDone(next);
    saveGuideProgress(g.slug, next);
  };
  const templates = g.templateSlugs.map(template).filter((x) => x !== undefined);
  const speech = [g.title, ...g.steps.map((s, i) => `${t('app:guides.stepN', { n: i + 1 })}. ${s.title}. ${s.body}`)].join('. ');
  const firstTemplate = templates[0];

  return (
    <Screen
      topBar={<TopBar title={category(g.categorySlug)?.title ?? t(`app:guides.type.${g.type}`)} />}
      dock={
        <>
          <ReadAloud text={speech} />
          {firstTemplate ? (
            <Button icon="document-text" label={t('app:guides.relatedTemplates')} onPress={() => router.push(`/template/${firstTemplate.slug}`)} />
          ) : (
            <Button icon="videocam" label={t('app:guides.getHelp')} onPress={() => router.push('/coming-soon/consult')} />
          )}
        </>
      }
    >
      <Txt variant="eyebrow">{t('app:guides.eyebrow')} · {t(`app:guides.type.${g.type}`)}</Txt>
      <Txt variant="h1">{g.title}</Txt>
      <Row gap={spacing.sm} style={{ flexWrap: 'wrap' }}>
        {pack.isSample ? <Chip label={t('app:guides.sample')} tone="warning" dot /> : <Chip label={t('app:guides.reviewed')} tone="accent" dot />}
        <Chip label={t('app:guides.stepN', { n: g.steps.length })} />
      </Row>
      <Txt variant="muted">{g.summary}</Txt>

      {/* Progress */}
      <Glass style={{ padding: spacing.lg, gap: spacing.sm }}>
        <ProgressBars total={g.steps.length} done={done.length} />
        <Txt variant="label">{t('app:guides.progress', { done: done.length, total: g.steps.length })}</Txt>
      </Glass>

      {/* Steps timeline */}
      <View style={{ marginTop: spacing.sm }}>
        {g.steps.map((step, i) => {
          const isDone = done.includes(i);
          const isCurrent = !isDone && done.length === i;
          const last = i === g.steps.length - 1;
          return (
            <View key={i} style={styles.stepRow}>
              <View style={styles.rail}>
                <Pressable
                  onPress={() => toggle(i)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isDone }}
                  accessibilityLabel={isDone ? t('app:guides.markNotDone', { n: i + 1 }) : t('app:guides.markDone', { n: i + 1 })}
                  hitSlop={10}
                  style={[styles.node, isDone ? styles.nodeDone : isCurrent ? styles.nodeCurrent : styles.nodeTodo]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={20} color={colors.textOnAccent} />
                  ) : (
                    <Text style={[styles.nodeText, { color: isCurrent ? colors.accentText : colors.textSubtle }]}>{i + 1}</Text>
                  )}
                </Pressable>
                {!last ? <View style={[styles.line, isDone && styles.lineDone]} /> : null}
              </View>
              <Pressable onPress={() => toggle(i)} style={styles.stepBody} accessibilityRole="none" importantForAccessibility="no">
                <Txt variant="h3" style={isDone && { color: colors.textMuted }}>
                  {step.title}
                </Txt>
                <Txt variant="muted">{step.body}</Txt>
              </Pressable>
            </View>
          );
        })}
      </View>

      {g.checklist.length > 0 ? (
        <Section title={t('app:guides.checklist')}>
          <Glass tone="accent" style={{ padding: spacing.lg, gap: spacing.sm }}>
            {g.checklist.map((item, i) => (
              <Row key={i} gap={spacing.sm} style={{ alignItems: 'flex-start' }}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.accentText} style={{ marginTop: 2 }} />
                <Txt style={{ flex: 1 }}>{item}</Txt>
              </Row>
            ))}
          </Glass>
        </Section>
      ) : null}

      {templates.length > 0 ? (
        <Section title={t('app:guides.relatedTemplates')}>
          {templates.map((tp) => (
            <ListItem key={tp.slug} icon="document-text-outline" title={tp.title} subtitle={t('app:templates.printReady')} onPress={() => router.push(`/template/${tp.slug}`)} />
          ))}
        </Section>
      ) : null}

      {g.externalLinks.length > 0 ? (
        <Section title={t('app:guides.links')}>
          {g.externalLinks.map((l) => (
            <ListItem key={l.url} icon="open-outline" title={l.label} subtitle={l.state} onPress={() => void Linking.openURL(l.url)} />
          ))}
        </Section>
      ) : null}

      <LegalDisclaimer />
    </Screen>
  );
}

const NODE = 36;
const styles = StyleSheet.create({
  stepRow: { flexDirection: 'row', gap: spacing.md },
  rail: { width: NODE + 12, alignItems: 'center' },
  node: { width: NODE, height: NODE, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  nodeDone: { backgroundColor: colors.accent },
  nodeCurrent: { borderWidth: 2, borderColor: colors.accentText, boxShadow: `0 0 0 5px ${colors.accentSoft}` },
  nodeTodo: { borderWidth: 1.5, borderColor: colors.lineStrong },
  nodeText: { fontFamily: fonts.headingBold, fontSize: 16 },
  line: { flex: 1, width: 2, minHeight: 16, marginVertical: spacing.xs, borderRadius: 1, backgroundColor: colors.line },
  lineDone: { backgroundColor: colors.accent },
  stepBody: { flex: 1, paddingTop: 4, paddingBottom: spacing.xl, gap: spacing.xs, borderRadius: radius.sm },
});
