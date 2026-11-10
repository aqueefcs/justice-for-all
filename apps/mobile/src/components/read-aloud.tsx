import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, iconSize, radius } from '@jfa/ui-tokens';
import { currentLocale } from '../lib/i18n';

const SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN' } as const;

/**
 * Square "Listen" button for docks: reads text aloud with the device's text-to-speech
 * (helps low-literacy and elderly users). Works offline.
 */
export function ReadAloud({ text }: { text: string }) {
  const { t } = useTranslation();
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={speaking ? t('stop') : t('readAloud')}
      accessibilityState={{ selected: speaking }}
      onPress={toggle}
      style={({ pressed }) => [styles.button, speaking && styles.active, pressed && { backgroundColor: colors.surfacePressed }]}
    >
      <Ionicons name={speaking ? 'stop' : 'volume-high-outline'} size={iconSize.md} color={speaking ? colors.accentText : colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  active: { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
});
