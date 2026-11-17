import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useT } from '@/components/form-fields';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/auth';

export function useReviewQueue(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['review-queue'],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/content/review-queue');
      if (error || !data) throw new Error('review queue');
      return data.items;
    },
  });
}

export function ReviewQueue() {
  const t = useT();
  const { user } = useCurrentUser();
  const queue = useReviewQueue();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t('review.title')}</h1>
        <p className="text-muted-foreground">{t('review.subtitle')}</p>
      </div>
      <div className="rounded-lg border bg-card">
        {queue.isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : queue.isError ? (
          <p className="p-6 text-destructive">{t('ui.error')}</p>
        ) : !queue.data?.length ? (
          <p className="p-6 text-muted-foreground">{t('review.empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('content.title')}</TableHead>
                <TableHead>{t('review.kind')}</TableHead>
                <TableHead>{t('review.author')}</TableHead>
                <TableHead>{t('review.waiting')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('ui.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.data.map((item) => (
                <TableRow key={`${item.kind}-${item.id}`}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{t(`content.kinds.${item.kind}`)}</TableCell>
                  <TableCell className="text-sm">{item.authorId === user?.id ? t('ui.you') : <span className="font-mono text-xs text-muted-foreground">{item.authorId?.slice(-6) ?? '—'}</span>}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/content/$kind/$id" params={{ kind: item.kind, id: item.id }}>
                        {t('review.open')}
                      </Link>
                    </Button>
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
