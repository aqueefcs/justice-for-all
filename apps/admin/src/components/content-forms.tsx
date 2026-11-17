import { Controller, get, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { GUIDE_TYPES, TEMPLATE_FIELD_TYPES, type Locale } from '@jfa/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import { titleOf, type ContentDoc, type Kind } from '@/lib/content-kinds';
import { CommaListField, Field, LineListField, NumberField, SelectField, TextareaField, TextField, useT } from './form-fields';
import { LocaleTabs } from './locale-tabs';
import { RichText } from './rich-text';

function useCategoryOptions() {
  const { data } = useQuery({
    queryKey: ['content', 'categories', 'options'],
    queryFn: () => apiFetch<{ items: ContentDoc[] }>('GET', '/v1/content/categories?limit=100'),
  });
  return (data?.items ?? []).map((c) => ({ value: c.slug, label: `${titleOf(c)} (${c.slug})` }));
}

function RichTextField({ name, label, insertables }: { name: string; label: string; insertables?: { label: string; text: string }[] }) {
  const t = useT();
  const { control, formState } = useFormContext();
  const error = (get(formState.errors, name) as { message?: string } | undefined)?.message;
  const id = `f-${name.replace(/[^\w-]/g, '-')}`;
  return (
    <Field id={id} label={label} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RichText
            id={id}
            value={(field.value as string | undefined) ?? ''}
            onChange={field.onChange}
            disabled={field.disabled}
            invalid={Boolean(error)}
            insertables={insertables}
            insertLabel={t('content.insertField')}
          />
        )}
      />
    </Field>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Topics (categories)
// ---------------------------------------------------------------------------

export function CategoryForm({ disabled }: { disabled: boolean }) {
  const t = useT();
  return (
    <>
      <Section title={t('content.kinds.categories')}>
        <TextField name="slug" label={t('content.slug')} hint={t('content.slugHint')} />
        <div className="grid grid-cols-2 gap-4">
          <TextField name="icon" label={t('content.icon')} />
          <NumberField name="order" label={t('content.order')} />
        </div>
      </Section>
      <Section title={t('content.translations')}>
        <LocaleTabs kind="categories" disabled={disabled}>
          {(loc) => (
            <>
              <TextField name={`translations.${loc}.title`} label={t('content.title')} />
              <TextareaField name={`translations.${loc}.description`} label={t('content.description')} />
            </>
          )}
        </LocaleTabs>
      </Section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Explainers (articles)
// ---------------------------------------------------------------------------

export function ArticleForm({ disabled }: { disabled: boolean }) {
  const t = useT();
  const categories = useCategoryOptions();
  return (
    <>
      <Section title={t('content.kinds.articles')}>
        <TextField name="slug" label={t('content.slug')} hint={t('content.slugHint')} />
        <SelectField name="categorySlug" label={t('content.category')} options={categories} />
        <CommaListField name="tags" label={t('content.tags')} />
      </Section>
      <Section title={t('content.translations')}>
        <LocaleTabs kind="articles" disabled={disabled}>
          {(loc) => (
            <>
              <TextField name={`translations.${loc}.title`} label={t('content.title')} />
              <TextareaField name={`translations.${loc}.summary`} label={t('content.summary')} rows={2} />
              <RichTextField name={`translations.${loc}.body`} label={t('content.body')} />
            </>
          )}
        </LocaleTabs>
      </Section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

function StepsEditor({ locale, disabled }: { locale: Locale; disabled: boolean }) {
  const t = useT();
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: `translations.${locale}.steps` });
  return (
    <div className="flex flex-col gap-3">
      <Label>{t('content.steps')}</Label>
      {fields.map((f, i) => (
        <div key={f.id} className="flex gap-3 rounded-lg border p-3">
          <span className="mt-2 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
          <div className="flex flex-1 flex-col gap-3">
            <TextField name={`translations.${locale}.steps.${i}.title`} label={t('content.stepTitle')} />
            <TextareaField name={`translations.${locale}.steps.${i}.body`} label={t('content.stepBody')} />
          </div>
          {!disabled && fields.length > 1 ? (
            <Button type="button" size="icon" variant="ghost" aria-label={t('ui.remove')} onClick={() => remove(i)}>
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      ))}
      {!disabled ? (
        <Button type="button" variant="outline" className="self-start" onClick={() => append({ title: '', body: '' })}>
          <Plus className="size-4" /> {t('content.addStep')}
        </Button>
      ) : null}
    </div>
  );
}

function LinksEditor({ disabled }: { disabled: boolean }) {
  const t = useT();
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'externalLinks' });
  return (
    <div className="flex flex-col gap-3">
      <Label>{t('content.links')}</Label>
      {fields.map((f, i) => (
        <div key={f.id} className="grid grid-cols-[1fr_1.5fr_1fr_auto] items-end gap-3">
          <TextField name={`externalLinks.${i}.label`} label={t('content.linkLabel')} />
          <TextField name={`externalLinks.${i}.url`} label={t('content.linkUrl')} />
          <TextField name={`externalLinks.${i}.state`} label={t('content.linkState')} />
          {!disabled ? (
            <Button type="button" size="icon" variant="ghost" aria-label={t('ui.remove')} onClick={() => remove(i)}>
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      ))}
      {!disabled ? (
        <Button type="button" variant="outline" className="self-start" onClick={() => append({ label: '', url: 'https://' })}>
          <Plus className="size-4" /> {t('content.addLink')}
        </Button>
      ) : null}
    </div>
  );
}

export function GuideForm({ disabled }: { disabled: boolean }) {
  const t = useT();
  const categories = useCategoryOptions();
  return (
    <>
      <Section title={t('content.kinds.guides')}>
        <TextField name="slug" label={t('content.slug')} hint={t('content.slugHint')} />
        <div className="grid grid-cols-2 gap-4">
          <SelectField name="type" label={t('content.guideType')} options={GUIDE_TYPES.map((g) => ({ value: g, label: t(`content.guideTypes.${g}`) }))} />
          <SelectField name="categorySlug" label={t('content.category')} options={categories} />
        </div>
        <CommaListField name="templateSlugs" label={t('content.templateSlugs')} />
        <LinksEditor disabled={disabled} />
      </Section>
      <Section title={t('content.translations')}>
        <LocaleTabs kind="guides" disabled={disabled}>
          {(loc) => (
            <>
              <TextField name={`translations.${loc}.title`} label={t('content.title')} />
              <TextareaField name={`translations.${loc}.summary`} label={t('content.summary')} rows={2} />
              <StepsEditor locale={loc} disabled={disabled} />
              <LineListField name={`translations.${loc}.checklist`} label={t('content.checklist')} />
            </>
          )}
        </LocaleTabs>
      </Section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Letters (templates)
// ---------------------------------------------------------------------------

function TemplateFieldsEditor({ disabled }: { disabled: boolean }) {
  const t = useT();
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'fields' });
  return (
    <div className="flex flex-col gap-3">
      <Label>{t('content.fields')}</Label>
      {fields.map((f, i) => (
        <div key={f.id} className="grid grid-cols-[1.2fr_1fr_auto_0.8fr_auto] items-end gap-3">
          <TextField name={`fields.${i}.key`} label={t('content.fieldKey')} />
          <Field id={`f-fields-${i}-type`} label={t('content.fieldType')}>
            <Controller
              control={control}
              name={`fields.${i}.type`}
              render={({ field }) => (
                <Select value={field.value as string} onValueChange={field.onChange} disabled={field.disabled}>
                  <SelectTrigger id={`f-fields-${i}-type`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_FIELD_TYPES.map((ft) => (
                      <SelectItem key={ft} value={ft}>
                        {t(`content.fieldTypes.${ft}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Controller
            control={control}
            name={`fields.${i}.required`}
            render={({ field }) => (
              <label className="flex h-9 items-center gap-2 text-sm">
                <Checkbox checked={Boolean(field.value)} onCheckedChange={(v) => field.onChange(v === true)} disabled={field.disabled} />
                {t('content.fieldRequired')}
              </label>
            )}
          />
          <NumberField name={`fields.${i}.maxLength`} label={t('content.fieldMaxLength')} />
          {!disabled && fields.length > 1 ? (
            <Button type="button" size="icon" variant="ghost" aria-label={t('ui.remove')} onClick={() => remove(i)}>
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <span />
          )}
        </div>
      ))}
      {!disabled ? (
        <Button type="button" variant="outline" className="self-start" onClick={() => append({ key: '', type: 'text', required: true })}>
          <Plus className="size-4" /> {t('content.addField')}
        </Button>
      ) : null}
    </div>
  );
}

function TemplateTranslation({ locale }: { locale: Locale }) {
  const t = useT();
  const { control, register } = useFormContext();
  const fields = (useWatch({ control, name: 'fields' }) ?? []) as { key: string }[];
  const keys = fields.map((f) => f.key).filter((k) => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(k));
  return (
    <>
      <TextField name={`translations.${locale}.title`} label={t('content.title')} />
      <TextareaField name={`translations.${locale}.summary`} label={t('content.summary')} rows={2} />
      <div className="flex flex-col gap-2">
        <Label>{t('content.fieldLabels')}</Label>
        <div className="grid grid-cols-2 gap-3">
          {keys.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <code className="w-36 shrink-0 truncate text-xs text-muted-foreground">{key}</code>
              <Input aria-label={key} {...register(`translations.${locale}.fieldLabels.${key}`)} />
            </div>
          ))}
        </div>
      </div>
      <RichTextField
        name={`translations.${locale}.bodyHtml`}
        label={t('content.letterText')}
        insertables={keys.map((k) => ({ label: k, text: `{{${k}}}` }))}
      />
    </>
  );
}

export function TemplateForm({ disabled }: { disabled: boolean }) {
  const t = useT();
  const categories = useCategoryOptions();
  return (
    <>
      <Section title={t('content.kinds.templates')}>
        <TextField name="slug" label={t('content.slug')} hint={t('content.slugHint')} />
        <SelectField name="categorySlug" label={t('content.category')} options={categories} />
        <TemplateFieldsEditor disabled={disabled} />
      </Section>
      <Section title={t('content.translations')}>
        <LocaleTabs kind="templates" disabled={disabled}>
          {(loc) => <TemplateTranslation locale={loc} />}
        </LocaleTabs>
      </Section>
    </>
  );
}

export const FORMS: Record<Kind, (props: { disabled: boolean }) => React.JSX.Element> = {
  guides: GuideForm,
  articles: ArticleForm,
  templates: TemplateForm,
  categories: CategoryForm,
};
