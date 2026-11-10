import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ComingSoonView } from '../../src/components/coming-soon';
import { Screen, TopBar } from '../../src/components/ui';
import { isFutureFeature, type FutureFeature } from '../../src/integrations/future';

/** Placeholder screens for later phases (consultations, documents, account, lawyer mode). */
export default function ComingSoon() {
  const { t } = useTranslation();
  const { feature } = useLocalSearchParams<{ feature: string }>();
  const key: FutureFeature = isFutureFeature(feature) ? feature : 'profile';
  return (
    <Screen topBar={<TopBar title={t('comingSoon')} />}>
      <ComingSoonView feature={key} />
    </Screen>
  );
}
