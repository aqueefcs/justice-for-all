import type { ReactNode } from 'react';
import { Controller, get, useFormContext, type FieldValues, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

/** Label + control + hint/error, with the error linked for screen readers. */
export function Field({ id, label, hint, error, children, className }: { id: string; label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function useFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  const err = get(errors, name) as { message?: string } | undefined;
  return err?.message;
}

const idFor = (name: string) => `f-${name.replace(/[^\w-]/g, '-')}`;

export function TextField<T extends FieldValues>({ name, label, hint, placeholder, className }: { name: Path<T>; label: string; hint?: string; placeholder?: string; className?: string }) {
  const { register } = useFormContext<T>();
  const error = useFieldError(name);
  const id = idFor(name);
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <Input id={id} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...register(name)} />
    </Field>
  );
}

export function TextareaField<T extends FieldValues>({ name, label, hint, rows = 3 }: { name: Path<T>; label: string; hint?: string; rows?: number }) {
  const { register } = useFormContext<T>();
  const error = useFieldError(name);
  const id = idFor(name);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <Textarea id={id} rows={rows} aria-invalid={Boolean(error)} {...register(name)} />
    </Field>
  );
}

export function NumberField<T extends FieldValues>({ name, label, className }: { name: Path<T>; label: string; className?: string }) {
  const { register } = useFormContext<T>();
  const error = useFieldError(name);
  const id = idFor(name);
  return (
    <Field id={id} label={label} error={error} className={className}>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        aria-invalid={Boolean(error)}
        {...register(name, { setValueAs: (v: string) => (v === '' || v === null || v === undefined ? undefined : Number(v)) })}
      />
    </Field>
  );
}

export function SelectField<T extends FieldValues>({ name, label, options, className }: { name: Path<T>; label: string; options: { value: string; label: string }[]; className?: string }) {
  const { control } = useFormContext<T>();
  const error = useFieldError(name);
  const id = idFor(name);
  return (
    <Field id={id} label={label} error={error} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={(field.value as string | undefined) ?? ''} onValueChange={field.onChange} disabled={field.disabled}>
            <SelectTrigger id={id} aria-invalid={Boolean(error)} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  );
}

/** A string[] edited as comma-separated text (tags, linked slugs). */
export function CommaListField<T extends FieldValues>({ name, label, hint }: { name: Path<T>; label: string; hint?: string }) {
  const { control } = useFormContext<T>();
  const error = useFieldError(name);
  const id = idFor(name);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            id={id}
            disabled={field.disabled}
            defaultValue={((field.value as string[] | undefined) ?? []).join(', ')}
            key={((field.value as string[] | undefined) ?? []).join(',')}
            onBlur={(e) =>
              field.onChange(
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        )}
      />
    </Field>
  );
}

/** A string[] edited one item per line (checklists). */
export function LineListField<T extends FieldValues>({ name, label, hint }: { name: Path<T>; label: string; hint?: string }) {
  const { control } = useFormContext<T>();
  const error = useFieldError(name);
  const id = idFor(name);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Textarea
            id={id}
            rows={4}
            disabled={field.disabled}
            defaultValue={((field.value as string[] | undefined) ?? []).join('\n')}
            key={((field.value as string[] | undefined) ?? []).join('|')}
            onBlur={(e) =>
              field.onChange(
                e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        )}
      />
    </Field>
  );
}

export function useT() {
  return useTranslation('admin').t;
}
