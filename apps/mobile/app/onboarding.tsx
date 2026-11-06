import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LOCALES, LOCALE_NATIVE_NAMES } from '@jfa/shared';
import { colors, radius, spacing, touchTarget, typography } from '@jfa/ui-tokens';
import { changeLanguage, currentLocale } from '../src/lib/i18n';

export default function Onboarding() {
  const { t } = useTranslation();
  const selected = currentLocale();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.app}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.title}>{t('app:onboarding.chooseLanguage')}</Text>
        {LOCALES.map((locale) => (
          <Pressable
            key={locale}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === locale }}
            onPress={() => void changeLanguage(locale)}
            style={[styles.option, selected === locale && styles.optionSelected]}
          >
            <Text style={[styles.optionText, selected === locale && styles.optionTextSelected]}>
              {LOCALE_NATIVE_NAMES[locale]}
            </Text>
          </Pressable>
        ))}
        <Text style={styles.hint}>{t('app:onboarding.changeLater')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void changeLanguage(currentLocale()); // persists the choice
            router.replace('/(tabs)');
          }}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>{t('continue')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy900 },
  hero: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  app: { color: colors.textOnDark, fontSize: typography.display, fontWeight: '800' },
  tagline: { color: colors.textOnDarkMuted, fontSize: typography.bodyLarge, marginTop: spacing.sm },
  panel: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text },
  option: { minHeight: touchTarget, borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, justifyContent: 'center', paddingHorizontal: spacing.lg },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceMuted },
  optionText: { fontSize: typography.bodyLarge, color: colors.text },
  optionTextSelected: { fontWeight: '700', color: colors.primary },
  hint: { fontSize: typography.caption, color: colors.textMuted },
  cta: { minHeight: touchTarget, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: colors.textOnDark, fontSize: typography.body, fontWeight: '700' },
});
