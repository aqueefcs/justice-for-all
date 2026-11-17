import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { CONTENT_STATUSES, type ContentStatus } from '@jfa/shared';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useT } from '@/components/form-fields';
import { StatusBadge } from '@/components/status-badge';
import { apiFetch } from '@/lib/api';
import { KINDS, titleOf, type ContentDoc, type Kind } from '@/lib/content-kinds';

export function ContentList({ kind }: { kind: Kind }) {
  const t = useT();
  const [status, setStatus] = useState<ContentStatus | 'all'>('all');
  const query = useQuery({
    queryKey: ['content', kind, 'list', status],
    queryFn: () =>
      apiFetch<{ items: ContentDoc[] }>('GET', `/v1/content/${kind}?limit=100${status === 'all' ? '' : `&status=${status}`}`),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">{t('nav.content')}</h1>
        <Button asChild>
          <Link to="/content/$kind/new" params={{ kind }}>
            <Plus className="size-4" /> {t('content.new')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={kind}>
          <TabsList>
            {KINDS.map((k) => (
              <TabsTrigger key={k} value={k} asChild>
                <Link to="/content/$kind" params={{ kind: k }}>
                  {t(`content.kinds.${k}`)}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus | 'all')}>
          <SelectTrigger className="w-48" aria-label={t('content.status')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('content.filterAll')}</SelectItem>
            {CONTENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`content.statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        {query.isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <p className="p-6 text-destructive">{t('ui.error')}</p>
        ) : query.data && query.data.items.length === 0 ? (
          <p className="p-6 text-muted-foreground">{t('content.empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('content.title')}</TableHead>
                <TableHead>{t('content.slug')}</TableHead>
                <TableHead>{t('content.status')}</TableHead>
                <TableHead>{t('content.updated')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.items.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <Link to="/content/$kind/$id" params={{ kind, id: doc.id }} className="hover:underline">
                      {titleOf(doc)}
                    </Link>
                    {doc.isSample ? <span className="ml-2 text-xs text-amber-700">●</span> : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{doc.slug}</TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(doc.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
