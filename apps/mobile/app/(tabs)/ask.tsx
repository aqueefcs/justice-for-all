import { useTranslation } from 'react-i18next';
import { ComingSoonView } from '../../src/components/coming-soon';
import { Screen, Txt } from '../../src/components/ui';

/** PHASE 4: AI legal-information assistant (citations + lawyer hand-off). Placeholder for now. */
export default function Ask() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Txt variant="h1" style={{ marginTop: 8, marginBottom: 8 }}>
        {t('tabs.ask')}
      </Txt>
      <ComingSoonView feature="ask" />
    </Screen>
  );
}
