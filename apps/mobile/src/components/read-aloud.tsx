import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as Speech from 'expo-speech';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius, spacing, touchTarget, typography } from '@jfa/ui-tokens';
import { currentLocale } from '../lib/i18n';

const SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN' } as const;

/** Reads text aloud with the device's text-to-speech (helps low-literacy users). Works offline. */
export function ReadAloud({ text, label }: { text: string; label: string }) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => void Speech.stop(), []);

  const toggle = () => {
    if (speaking) {
      void Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      language: SPEECH_LANG[currentLocale()],
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={toggle} style={styles.button}>
      <Ionicons name={speaking ? 'stop-circle' : 'volume-high'} size={22} color={colors.primary} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: { fontSize: typography.body, color: colors.primary, fontWeight: '600' },
});
