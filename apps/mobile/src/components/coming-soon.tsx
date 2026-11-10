import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, gradients, radius, spacing } from '@jfa/ui-tokens';
import type { FutureFeature } from '../integrations/future';
import { Chip, Glass, Txt, type IconName } from './ui';

export const FEATURE_ICONS: Record<FutureFeature | 'ask', IconName> = {
  consult: 'videocam',
  ask: 'sparkles',
  documents: 'folder-open',
  profile: 'person-circle',
  lawyer: 'briefcase',
};

/** Polished placeholder for features in later phases. Collects no data. */
export function ComingSoonView({ feature }: { feature: FutureFeature | 'ask' }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: spacing.lg }}>
      <Glass tone="accent" style={styles.hero}>
        <LinearGradient colors={gradients.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
          <Ionicons name={FEATURE_ICONS[feature]} size={40} color={colors.textOnAccent} />
        </LinearGradient>
        <Chip label={t('app:comingSoon.badge')} tone="accent" dot />
        <Txt variant="h2" style={{ textAlign: 'center' }}>
          {t(`app:comingSoon.${feature}.title`)}
        </Txt>
        <Txt variant="muted" style={{ textAlign: 'center' }}>
          {t(`app:comingSoon.${feature}.body`)}
        </Txt>
      </Glass>
      <Txt variant="label" style={{ textAlign: 'center' }}>
        {t('app:comingSoon.body')}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
  orb: { width: 88, height: 88, borderRadius: radius.xl + 6, alignItems: 'center', justifyContent: 'center', boxShadow: `0 18px 40px -16px ${colors.accentGlow}`, marginBottom: spacing.sm },
});
