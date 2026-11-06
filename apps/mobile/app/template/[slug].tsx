import { useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { fillTemplate, type TemplateField } from '@jfa/shared';
import { Body, EmptyState, Field, Heading, LegalDisclaimer, PrimaryButton, SampleBanner, Screen } from '../../src/components/ui';
import { useContentLookup } from '../../src/content/content-context';
import { captureError } from '../../src/integrations';

const DATE_RE = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

function validate(field: TemplateField, value: string, t: TFunction): string | undefined {
  const v = value.trim();
  if (field.required && !v) return t('app:templates.required');
  if (field.maxLength && v.length > field.maxLength) return t('app:templates.tooLong', { max: field.maxLength });
  if (v && field.type === 'date' && !DATE_RE.test(v)) return t('app:templates.invalidDate');
  return undefined;
}

/**
 * Fill a drafting template and create a PDF ON THE DEVICE (expo-print).
 * Privacy: the values never leave the phone and are not stored (DPDP data minimisation).
 */
export default function TemplateScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { template } = useContentLookup();
  const tp = template(slug);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);
  if (!tp) return <EmptyState text={t('app:library.noResults')} />;

  const generate = async () => {
    const nextErrors = Object.fromEntries(tp.fields.map((f) => [f.key, validate(f, values[f.key] ?? '', t)]));
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setBusy(true);
    try {
      const body = fillTemplate(tp.bodyHtml, values);
      const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head><body>${body}</body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: t('app:templates.share'), UTI: 'com.adobe.pdf' });
      } else {
        await Print.printAsync({ uri });
      }
    } catch (err) {
      captureError(err);
      Alert.alert(t('errorGeneric'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('app:templates.title') }} />
      <SampleBanner />
      <Heading>{tp.title}</Heading>
      <Body muted>{tp.summary}</Body>
      <Body muted>🔒 {t('app:templates.privacyNote')}</Body>

      {tp.fields.map((f) => (
        <Field
          key={f.key}
          label={`${tp.fieldLabels[f.key] ?? f.key}${f.required ? ' *' : ''}`}
          value={values[f.key] ?? ''}
          onChangeText={(text) => setValues((v) => ({ ...v, [f.key]: text }))}
          error={errors[f.key]}
          multiline={f.type === 'multiline'}
          maxLength={f.maxLength}
          keyboardType={f.type === 'phone' ? 'phone-pad' : f.type === 'number' ? 'numeric' : 'default'}
          placeholder={f.type === 'date' ? 'DD-MM-YYYY' : undefined}
          autoComplete="off"
        />
      ))}

      <PrimaryButton label={t('app:templates.generatePdf')} icon="document" onPress={() => void generate()} disabled={busy} />
      <LegalDisclaimer />
    </Screen>
  );
}
