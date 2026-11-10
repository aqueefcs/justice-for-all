import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { LOCALES, LOCALE_NATIVE_NAMES, type Locale } from '@jfa/shared';
import { colors, fonts, radius, spacing } from '@jfa/ui-tokens';
import { Logo } from '../src/components/logo';
import { Button, Row, Screen, Txt } from '../src/components/ui';
import { changeLanguage, currentLocale } from '../src/lib/i18n';

/** English names under each native name, so helpers can guide someone else. */
const ENGLISH_NAMES: Record<Locale, string> = { en: 'English', hi: 'Hindi' };

export default function Onboarding() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Locale>(currentLocale());

  const choose = (locale: Locale) => {
    setSelected(locale);
    void changeLanguage(locale);
  };

  return (
    <Screen
      dock={
        <Button
          label={t('app:onboarding.continueIn', { lang: LOCALE_NATIVE_NAMES[selected] })}
          trailing={<Ionicons name="arrow-forward" size={18} color={colors.textOnAccent} />}
          onPress={() => {
            void changeLanguage(selected); // persists the choice
            router.replace('/(tabs)');
          }}
        />
      }
    >
      <Row style={{ marginTop: spacing.xxl }}>
        <Logo size={72} />
      </Row>
      <Txt variant="eyebrow" style={{ marginTop: spacing.xl }}>
        {t('appName')}
      </Txt>
      <Txt variant="display">{t('app:onboarding.chooseLanguage')}</Txt>
      <Txt variant="muted">{t('app:onboarding.changeLater')}</Txt>

      <View style={{ gap: spacing.md, marginTop: spacing.lg }} accessibilityRole="radiogroup">
        {LOCALES.map((locale) => {
          const on = locale === selected;
          return (
            <Pressable
              key={locale}
              onPress={() => choose(locale)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${LOCALE_NATIVE_NAMES[locale]}, ${ENGLISH_NAMES[locale]}`}
              style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && !on && { backgroundColor: colors.surfacePressed }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.native}>{LOCALE_NATIVE_NAMES[locale]}</Text>
                <Txt variant="label">{ENGLISH_NAMES[locale]}</Txt>
              </View>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <Ionicons name="checkmark" size={18} color={colors.textOnAccent} /> : null}</View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  optionOn: { backgroundColor: colors.accentSoft, borderColor: colors.accentText, boxShadow: `0 10px 28px -14px ${colors.accentGlow}` },
  native: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  radio: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
