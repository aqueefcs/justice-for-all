import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, fonts, gradients, iconSize, radius, spacing, touchTarget, typography } from '@jfa/ui-tokens';
import { useContent } from '../content/content-context';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'bodyStrong' | 'muted' | 'label' | 'eyebrow';

export function Txt({
  variant = 'body',
  style,
  children,
  accent,
  numberOfLines,
}: {
  variant?: Variant;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  /** Render in the accent colour (replaces the mockup's gradient text for legibility). */
  accent?: boolean;
  numberOfLines?: number;
}) {
  const isHeading = variant === 'display' || variant === 'h1' || variant === 'h2' || variant === 'h3';
  return (
    <Text
      accessibilityRole={isHeading ? 'header' : undefined}
      numberOfLines={numberOfLines}
      style={[text[variant], accent && { color: colors.accentText }, style]}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/** Dark glass ground with a soft violet glow from the top-right corner. */
export function Ground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={gradients.ground}
        locations={[0, 0.45, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

/**
 * A full screen: ground, optional top bar (inside the safe area), scrollable content and an
 * optional fixed dock (bottom action bar).
 */
export function Screen({
  children,
  topBar,
  dock,
  scroll = true,
  insetTop = true,
  contentStyle,
}: {
  children: ReactNode;
  topBar?: ReactNode;
  dock?: ReactNode;
  scroll?: boolean;
  /** Tab screens draw their own header inside the safe area. */
  insetTop?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const inner = <View style={[styles.content, contentStyle]}>{children}</View>;
  return (
    <Ground>
      <View style={{ height: insetTop ? insets.top : 0 }} />
      {topBar}
      {scroll ? (
        <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          {inner}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{inner}</View>
      )}
      {dock ? <View style={[styles.dock, { paddingBottom: insets.bottom + spacing.md }]}>{dock}</View> : null}
    </Ground>
  );
}

/** Top bar for detail screens: back button, small breadcrumb text, optional right element. */
export function TopBar({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.topBar}>
      <IconButton icon="chevron-back" label={t('back')} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} />
      <Txt variant="muted" style={styles.flex} numberOfLines={1}>
        {title ?? ''}
      </Txt>
      {right}
    </View>
  );
}

export function Row({ children, style, gap = spacing.md }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[styles.row, { gap }, style]}>{children}</View>;
}

export function Section({ title, children, style }: { title?: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: spacing.sm, marginTop: spacing.lg }, style]}>
      {title ? <Txt variant="eyebrow">{title}</Txt> : null}
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function Glass({ children, style, tone = 'default' }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'default' | 'accent' | 'warning' }) {
  return <View style={[styles.glass, tone === 'accent' && styles.glassAccent, tone === 'warning' && styles.glassWarning, style]}>{children}</View>;
}

/** Rounded icon chip. `onAccent` = dark icon on the gradient tile. */
export function IconBadge({ icon, onAccent, size = 44 }: { icon: IconName; onAccent?: boolean; size?: number }) {
  return (
    <View
      style={[
        styles.iconBadge,
        { width: size, height: size, borderRadius: size * 0.33 },
        onAccent && { backgroundColor: 'rgba(5,6,10,0.12)' },
      ]}
    >
      <Ionicons name={icon} size={iconSize.md} color={onAccent ? colors.textOnAccent : colors.accentText} />
    </View>
  );
}

/** Home grid tile. `hot` = the single highlighted (gradient) tile. */
export function Tile({ icon, title, subtitle, onPress, hot, badge }: { icon: IconName; title: string; subtitle?: string; onPress: () => void; hot?: boolean; badge?: string }) {
  const body = (
    <>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <IconBadge icon={icon} onAccent={hot} />
        {badge ? <Chip label={badge} tone={hot ? 'onAccent' : 'default'} /> : null}
      </Row>
      <View style={{ gap: spacing.xxs }}>
        <Txt variant="h3" style={hot && { color: colors.textOnAccent }}>{title}</Txt>
        {subtitle ? <Txt variant="label" style={hot ? { color: '#1B1D2A' } : undefined}>{subtitle}</Txt> : null}
      </View>
    </>
  );
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, badge].filter(Boolean).join('. ')}
      style={({ pressed }) => [styles.tileWrap, pressed && styles.pressed]}
    >
      {hot ? (
        <LinearGradient colors={gradients.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.tile, styles.tileHot]}>
          {body}
        </LinearGradient>
      ) : (
        <View style={[styles.tile, styles.glass]}>{body}</View>
      )}
    </Pressable>
  );
}

/** Tappable row. `card` renders it as its own glass card; otherwise it is a plain row for lists. */
export function ListItem({
  title,
  subtitle,
  icon,
  badge,
  leading,
  trailingIcon = 'chevron-forward',
  onPress,
  card = true,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  badge?: string;
  leading?: ReactNode;
  trailingIcon?: IconName;
  onPress: () => void;
  card?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, badge].filter(Boolean).join('. ')}
      style={({ pressed }) => [styles.listItem, card && styles.glass, pressed && (card ? styles.glassPressed : styles.pressed)]}
    >
      {leading ?? (icon ? <IconBadge icon={icon} size={40} /> : null)}
      <View style={styles.flex}>
        <Txt variant="bodyStrong">{title}</Txt>
        {subtitle ? <Txt variant="label" numberOfLines={2}>{subtitle}</Txt> : null}
      </View>
      {badge ? <Chip label={badge} tone="warning" /> : null}
      <Ionicons name={trailingIcon} size={iconSize.sm} color={colors.accentText} />
    </Pressable>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

export function IconButton({ icon, label, onPress, size = touchTarget }: { icon: IconName; label: string; onPress: () => void; size?: number }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, { width: size, height: size }, pressed && styles.glassPressed]}
    >
      <Ionicons name={icon} size={iconSize.md} color={colors.text} />
    </Pressable>
  );
}

/** Primary (gradient) or secondary (glass) button. One primary per screen. */
export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  trailing,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const primary = variant === 'primary';
  const content = (
    <>
      {icon ? <Ionicons name={icon} size={iconSize.sm} color={primary ? colors.textOnAccent : colors.text} /> : null}
      <Text style={[text.button, { color: primary ? colors.textOnAccent : colors.text }]}>{label}</Text>
      {trailing}
    </>
  );
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.buttonWrap, pressed && styles.pressed, disabled && styles.disabled, style]}
    >
      {primary ? (
        <LinearGradient colors={gradients.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, styles.buttonGlow]}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.button, styles.glass]}>{content}</View>
      )}
    </Pressable>
  );
}

export function Chip({ label, tone = 'default', dot }: { label: string; tone?: 'default' | 'accent' | 'warning' | 'onAccent'; dot?: boolean }) {
  const toneStyle =
    tone === 'accent' ? styles.chipAccent : tone === 'warning' ? styles.chipWarning : tone === 'onAccent' ? styles.chipOnAccent : null;
  const color =
    tone === 'accent' ? colors.accentText : tone === 'warning' ? colors.warning : tone === 'onAccent' ? colors.textOnAccent : colors.textMuted;
  return (
    <View style={[styles.chip, toneStyle]}>
      {dot ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <Text style={[text.chip, { color }]}>{label}</Text>
    </View>
  );
}

/** Faux search field that opens the search screen. */
export function SearchBar({ placeholder, onPress }: { placeholder: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel={placeholder}
      style={({ pressed }) => [styles.search, pressed && styles.glassPressed]}
    >
      <Ionicons name="search" size={iconSize.md} color={colors.accentText} />
      <Txt variant="muted" style={styles.flex} numberOfLines={1}>
        {placeholder}
      </Txt>
      <View style={styles.searchGo}>
        <Ionicons name="arrow-forward" size={iconSize.sm} color={colors.textOnAccent} />
      </View>
    </Pressable>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.segmented} accessibilityRole="tablist">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={[styles.segment, selected && styles.segmentOn]}
          >
            <Text style={[text.segment, { color: selected ? colors.text : colors.textMuted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field(props: TextInputProps & { label: string; error?: string }) {
  const { label, error, style, ...input } = props;
  return (
    <View style={{ gap: spacing.sm }}>
      <Txt variant="label">{label}</Txt>
      <TextInput
        {...input}
        accessibilityLabel={label}
        placeholderTextColor={colors.textSubtle}
        selectionColor={colors.accent}
        style={[styles.input, input.multiline && styles.inputMultiline, error ? styles.inputError : null, style]}
      />
      {error ? (
        <Text style={[text.label, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function ProgressBars({ total, done }: { total: number; done: number }) {
  return (
    <View style={styles.bars} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: done }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.bar, i < done && styles.barOn]} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Notices
// ---------------------------------------------------------------------------

/** "Legal information, not legal advice" — required on every content screen. */
export function LegalDisclaimer() {
  const { t } = useTranslation();
  return (
    <Row style={styles.disclaimer} gap={spacing.sm}>
      <Ionicons name="information-circle-outline" size={iconSize.sm} color={colors.textSubtle} />
      <Txt variant="label" style={styles.flex}>
        {t('disclaimer')}
      </Txt>
    </Row>
  );
}

/** Shown while the pack contains un-reviewed SAMPLE content. */
export function SampleBanner() {
  const { t } = useTranslation();
  const pack = useContent();
  if (!pack.isSample) return null;
  return (
    <Glass tone="warning" style={styles.sample}>
      <Ionicons name="flask-outline" size={iconSize.sm} color={colors.warning} />
      <Text style={[text.label, { color: colors.warning, flex: 1 }]}>{t('sampleBanner')}</Text>
    </Glass>
  );
}

export function EmptyState({ text: message }: { text: string }) {
  return (
    <Txt variant="muted" style={{ textAlign: 'center', marginVertical: spacing.xxl }}>
      {message}
    </Txt>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const text = StyleSheet.create({
  display: { fontFamily: fonts.heading, fontSize: typography.display, lineHeight: typography.display * 1.08, color: colors.text, letterSpacing: -0.8 },
  h1: { fontFamily: fonts.heading, fontSize: typography.h1, lineHeight: typography.h1 * 1.12, color: colors.text, letterSpacing: -0.6 },
  h2: { fontFamily: fonts.heading, fontSize: typography.h2, lineHeight: typography.h2 * 1.15, color: colors.text, letterSpacing: -0.4 },
  h3: { fontFamily: fonts.heading, fontSize: typography.h3, lineHeight: typography.h3 * 1.3, color: colors.text, letterSpacing: -0.1 },
  title: { fontFamily: fonts.bodySemibold, fontSize: typography.title, lineHeight: 28, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: typography.body, lineHeight: 25, color: colors.text },
  bodyStrong: { fontFamily: fonts.bodySemibold, fontSize: typography.body, lineHeight: 23, color: colors.text },
  muted: { fontFamily: fonts.body, fontSize: typography.body, lineHeight: 24, color: colors.textMuted },
  label: { fontFamily: fonts.body, fontSize: typography.label, lineHeight: 20, color: colors.textMuted },
  eyebrow: { fontFamily: fonts.bodySemibold, fontSize: typography.label, lineHeight: 18, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.accentText },
  button: { fontFamily: fonts.bodySemibold, fontSize: typography.body },
  chip: { fontFamily: fonts.bodyMedium, fontSize: typography.label },
  segment: { fontFamily: fonts.bodySemibold, fontSize: typography.body },
});

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, gap: spacing.md },
  dock: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.sm, flexDirection: 'row', backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.line },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  glass: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.xl },
  glassPressed: { backgroundColor: colors.surfacePressed },
  glassAccent: { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
  glassWarning: { backgroundColor: colors.warningSoft, borderColor: colors.warningBorder },
  iconBadge: { backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  tileWrap: { flexBasis: '47%', flexGrow: 1 },
  tile: { minHeight: 132, padding: spacing.lg, borderRadius: radius.xl, justifyContent: 'space-between', gap: spacing.md },
  tileHot: { boxShadow: `0 14px 32px -14px ${colors.accentGlow}` },
  listItem: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.lg },
  divider: { height: 1, backgroundColor: colors.line },
  iconButton: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  buttonWrap: { flexGrow: 1 },
  button: { minHeight: 56, borderRadius: radius.lg, paddingHorizontal: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  buttonGlow: { boxShadow: `0 12px 28px -12px ${colors.accentGlow}` },
  chip: { minHeight: 32, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, alignSelf: 'flex-start' },
  chipAccent: { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
  chipWarning: { backgroundColor: colors.warningSoft, borderColor: colors.warningBorder },
  chipOnAccent: { backgroundColor: 'rgba(5,6,10,0.12)', borderColor: 'transparent' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  search: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingLeft: spacing.lg, paddingRight: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accentBorder, boxShadow: `0 0 0 4px ${colors.accentSoft}` },
  searchGo: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  segmented: { flexDirection: 'row', padding: spacing.xs, gap: spacing.xs, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  segment: { flex: 1, minHeight: touchTarget, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.surfaceStrong },
  input: { minHeight: 56, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, fontFamily: fonts.body, fontSize: typography.body, color: colors.text },
  inputMultiline: { minHeight: 130, paddingTop: spacing.md, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  bars: { flexDirection: 'row', gap: spacing.xs },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.13)' },
  barOn: { backgroundColor: colors.accent },
  disclaimer: { alignItems: 'flex-start', padding: spacing.md, marginTop: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },
  sample: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md },
});
