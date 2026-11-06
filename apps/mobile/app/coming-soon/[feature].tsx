import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@jfa/ui-tokens';
import { Body, Screen, type IconName } from '../../src/components/ui';
import { isFutureFeature, type FutureFeature } from '../../src/integrations/future';

const ICONS: Record<FutureFeature, IconName> = {
  consult: 'videocam',
  documents: 'folder-open',
  profile: 'person-circle',
  lawyer: 'briefcase',
};

/**
 * Placeholder screens for features in later phases (consultations, documents, account, lawyer mode).
 * Deliberately collects no data.
 */
export default function ComingSoon() {
  const { t } = useTranslation();
  const { feature } = useLocalSearchParams<{ feature: string }>();
  const key: FutureFeature = isFutureFeature(feature) ? feature : 'profile';

  return (
    <Screen>
      <Stack.Screen options={{ title: t(`app:comingSoon.${key}.title`) }} />
      <View style={styles.hero}>
        <Ionicons name={ICONS[key]} size={56} color={colors.textOnDark} />
        <Text style={styles.badge}>{t('app:comingSoon.badge')}</Text>
        <Text style={styles.title}>{t(`app:comingSoon.${key}.title`)}</Text>
      </View>
      <Body>{t(`app:comingSoon.${key}.body`)}</Body>
      <Body muted>{t('app:comingSoon.body')}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.navy800, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  badge: { color: colors.navy900, backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, fontWeight: '700', fontSize: typography.caption, overflow: 'hidden' },
  title: { color: colors.textOnDark, fontSize: typography.title, fontWeight: '700', textAlign: 'center' },
});
