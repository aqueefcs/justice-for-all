import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ArrowLeft, Info } from 'lucide-react';
import type { ContentStatus } from '@jfa/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FORMS } from '@/components/content-forms';
import { useT } from '@/components/form-fields';
import { StatusBadge } from '@/components/status-badge';
import { ApiError, apiFetch } from '@/lib/api';
import { can, useCurrentUser } from '@/lib/auth';
import { emptyDoc, KIND_SCHEMAS, titleOf, toFormValues, type ContentDoc, type Kind } from '@/lib/content-kinds';

type Values = Record<string, unknown>;

export function ContentEditor({ kind, id }: { kind: Kind; id?: string }) {
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const isNew = !id;

  const query = useQuery({
    enabled: !isNew,
    queryKey: ['content', kind, id],
    queryFn: () => apiFetch<ContentDoc>('GET', `/v1/content/${kind}/${id}`),
  });
  const doc = query.data;
  const editable = isNew || doc?.status === 'draft';

  const form = useForm<Values>({
    resolver: zodResolver(KIND_SCHEMAS[kind] as never),
    defaultValues: emptyDoc(kind),
    mode: 'onBlur',
    disabled: !editable,
  });
  useEffect(() => {
    if (doc) form.reset(toFormValues(doc));
  }, [doc, form]);

  /** Shows the API's field-level validation errors next to the right inputs. */
  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.details?.length) {
      for (const d of error.details) form.setError(d.path as never, { message: d.message });
      toast.error(t('workflow.validationFailed'));
    } else {
      toast.error(error instanceof Error ? error.message : t('ui.error'));
    }
  };

  const save = useMutation({
    mutationFn: (values: Values) =>
      isNew ? apiFetch<ContentDoc>('POST', `/v1/content/${kind}`, values) : apiFetch<ContentDoc>('PATCH', `/v1/content/${kind}/${id}`, values),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ['content', kind] });
      if (isNew) {
        toast.success(t('workflow.created'));
        void navigate({ to: '/content/$kind/$id', params: { kind, id: saved.id } });
      } else {
        queryClient.setQueryData(['content', kind, id], saved);
        toast.success(t('ui.saved'));
      }
    },
    onError: handleError,
  });

  const changeStatus = useMutation({
    mutationFn: (status: ContentStatus) => apiFetch<ContentDoc>('POST', `/v1/content/${kind}/${id}/status`, { status }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(['content', kind, id], updated);
      await queryClient.invalidateQueries({ queryKey: ['content'] });
      await queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      toast.success(t('workflow.statusChanged', { status: t(`content.statuses.${updated.status}`) }));
    },
    onError: handleError,
  });

  const busy = save.isPending || changeStatus.isPending;
  const onSave = form.handleSubmit((values) => save.mutate(values), () => toast.error(t('workflow.validationFailed')));
  const onSubmitForReview = form.handleSubmit(
    async (values) => {
      await save.mutateAsync(values);
      changeStatus.mutate('in_review');
    },
    () => toast.error(t('workflow.validationFailed')),
  );

  if (!isNew && query.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!isNew && query.isError) return <p className="text-destructive">{t('ui.error')}</p>;

  const isAuthor = Boolean(doc?.authorId && doc.authorId === user?.id);
  const Form = FORMS[kind];

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Link to="/content/$kind" params={{ kind }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> {t(`content.kinds.${kind}`)}
            </Link>
            <h1 className="font-heading text-2xl font-semibold">{doc ? titleOf(doc) : `${t('content.new')} — ${t(`content.kinds.${kind}`)}`}</h1>
            {doc ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <StatusBadge status={doc.status} />
                <span>v{doc.version}</span>
                <span>
                  {t('content.updated')}: {new Date(doc.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {(isNew || doc?.status === 'draft') && (
              <>
                <Button type="button" variant="outline" disabled={busy} onClick={onSave}>
                  {t('workflow.saveDraft')}
                </Button>
                {!isNew && (
                  <Button type="button" disabled={busy} onClick={onSubmitForReview}>
                    {t('workflow.submitForReview')}
                  </Button>
                )}
              </>
            )}
            {doc?.status === 'in_review' && (
              <>
                <Button type="button" variant="outline" disabled={busy} onClick={() => changeStatus.mutate('draft')}>
                  {t('workflow.sendBack')}
                </Button>
                {can.publish(user) && !isAuthor && (
                  <Button type="button" disabled={busy} onClick={() => changeStatus.mutate('published')}>
                    {t('workflow.approve')}
                  </Button>
                )}
              </>
            )}
            {doc?.status === 'published' && (
              <Button type="button" variant="outline" disabled={busy} onClick={() => changeStatus.mutate('draft')}>
                {t('workflow.reopen')}
              </Button>
            )}
            {(doc?.status === 'draft' || doc?.status === 'published') && (
              <Button type="button" variant="ghost" className="text-destructive" disabled={busy} onClick={() => changeStatus.mutate('archived')}>
                {t('workflow.archive')}
              </Button>
            )}
            {doc?.status === 'archived' && (
              <Button type="button" variant="outline" disabled={busy} onClick={() => changeStatus.mutate('draft')}>
                {t('workflow.restore')}
              </Button>
            )}
          </div>
        </div>

        {doc?.status === 'in_review' && can.publish(user) && isAuthor ? (
          <Alert>
            <Info className="size-4" />
            <AlertDescription>{t('workflow.cantApproveOwn')}</AlertDescription>
          </Alert>
        ) : null}
        {doc && !editable && doc.status !== 'in_review' ? (
          <Alert>
            <Info className="size-4" />
            <AlertDescription>{t('workflow.onlyDrafts')}</AlertDescription>
          </Alert>
        ) : null}
        {doc?.published && doc.status !== 'published' ? (
          <Alert>
            <Info className="size-4" />
            <AlertDescription>{t('content.liveVersion')}</AlertDescription>
          </Alert>
        ) : null}
        {doc?.isSample ? (
          <Alert className="border-amber-300 bg-amber-50 text-amber-900">
            <Info className="size-4" />
            <AlertDescription>{t('content.sampleFlag')}</AlertDescription>
          </Alert>
        ) : null}

        <Form disabled={!editable} />
      </form>
    </FormProvider>
  );
}
