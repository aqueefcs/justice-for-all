import { useTranslation } from 'react-i18next';
import { ComingSoonView } from '../../src/components/coming-soon';
import { Screen, Txt } from '../../src/components/ui';

/** PHASE 2: document inbox (uploads + lawyer drafts via signed URLs). Placeholder for now. */
export default function Docs() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Txt variant="h1" style={{ marginTop: 8, marginBottom: 8 }}>
        {t('tabs.docs')}
      </Txt>
      <ComingSoonView feature="documents" />
    </Screen>
  );
}
