import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, touchTarget, typography } from '@jfa/ui-tokens';
import { useContent } from '../content/content-context';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Scrollable screen with consistent padding. */
export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const content = <View style={[styles.screenInner, { paddingBottom: insets.bottom + spacing.xl }]}>{children}</View>;
  return scroll ? (
    <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled">
      {content}
    </ScrollView>
  ) : (
    <View style={styles.screen}>{content}</View>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return <Text style={styles.heading} accessibilityRole="header">{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle} accessibilityRole="header">{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>;
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

/** Tappable row with icon, title and optional subtitle. */
export function ListItem(props: { title: string; subtitle?: string; icon?: IconName; badge?: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel={props.subtitle ? `${props.title}. ${props.subtitle}` : props.title}
      style={({ pressed }) => [styles.listItem, pressed && styles.pressed]}
    >
      {props.icon ? (
        <View style={styles.iconBubble}>
          <Ionicons name={props.icon} size={22} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.flex}>
        <Text style={styles.listTitle}>{props.title}</Text>
        {props.subtitle ? <Text style={styles.listSubtitle} numberOfLines={2}>{props.subtitle}</Text> : null}
      </View>
      {props.badge ? <Text style={styles.badge}>{props.badge}</Text> : null}
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress, icon, disabled }: { label: string; onPress: () => void; icon?: IconName; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.button, pressed && { backgroundColor: colors.primaryPressed }, disabled && styles.disabled]}
    >
      {icon ? <Ionicons name={icon} size={20} color={colors.textOnDark} /> : null}
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string; error?: string }) {
  const { label, error, style, ...input } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, input.multiline && styles.inputMultiline, error ? styles.inputError : null, style]}
      />
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
    </View>
  );
}

/** "Legal information, not legal advice" — required on every content screen. */
export function LegalDisclaimer() {
  const { t } = useTranslation();
  return (
    <View style={styles.disclaimer} accessibilityRole="text">
      <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
      <Text style={styles.disclaimerText}>{t('disclaimer')}</Text>
    </View>
  );
}

/** Shown while the pack contains un-reviewed SAMPLE content. */
export function SampleBanner() {
  const { t } = useTranslation();
  const pack = useContent();
  if (!pack.isSample) return null;
  return (
    <View style={styles.sample}>
      <Ionicons name="flask-outline" size={18} color={colors.sampleText} />
      <Text style={styles.sampleText}>{t('sampleBanner')}</Text>
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <Text style={[styles.body, styles.muted, { textAlign: 'center', marginVertical: spacing.xl }]}>{text}</Text>;
}

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.surfaceMuted },
  screenInner: { padding: spacing.lg, gap: spacing.md },
  heading: { fontSize: typography.heading, fontWeight: '700', color: colors.text },
  sectionTitle: { fontSize: typography.title, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  body: { fontSize: typography.body, lineHeight: 24, color: colors.text },
  muted: { color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  listItem: {
    minHeight: touchTarget + 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  iconBubble: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  listTitle: { fontSize: typography.body, fontWeight: '600', color: colors.text },
  listSubtitle: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  badge: { fontSize: typography.caption, color: colors.warning, fontWeight: '600' },
  button: {
    minHeight: touchTarget,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: { color: colors.textOnDark, fontSize: typography.body, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  field: { gap: spacing.xs },
  fieldLabel: { fontSize: typography.body, fontWeight: '600', color: colors.text },
  input: {
    minHeight: touchTarget,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    color: colors.text,
  },
  inputMultiline: { minHeight: 120, paddingTop: spacing.md, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: typography.caption },
  disclaimer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.sm, marginTop: spacing.lg },
  disclaimerText: { flex: 1, fontSize: typography.caption, lineHeight: 20, color: colors.textMuted },
  sample: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', padding: spacing.sm, backgroundColor: colors.sampleBg, borderRadius: radius.sm },
  sampleText: { flex: 1, fontSize: typography.caption, color: colors.sampleText, fontWeight: '600' },
});
