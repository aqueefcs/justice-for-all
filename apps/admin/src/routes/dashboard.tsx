import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CONTENT_STATUSES } from '@jfa/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useT } from '@/components/form-fields';
import { api } from '@/lib/api';
import { can, useCurrentUser } from '@/lib/auth';
import { useReviewQueue } from './review';

export function Dashboard() {
  const t = useT();
  const { user } = useCurrentUser();
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/health');
      if (error || !data) throw new Error('down');
      return data;
    },
  });
  const summary = useQuery({
    queryKey: ['content', 'summary'],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/content/summary');
      if (error || !data) throw new Error('summary');
      return data.kinds;
    },
  });
  const queue = useReviewQueue(can.publish(user));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">{t('dashboard.welcome', { name: user?.name ?? '' })}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {can.publish(user) ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">{t('review.title')}</CardTitle>
              <CardDescription>{t('dashboard.waitingReview', { count: queue.data?.length ?? 0 })}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/review">{t('dashboard.openQueue')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">{t('dashboard.apiStatus')}</CardTitle>
            <CardDescription>
              {health.data ? (
                <span className="text-emerald-700">● {t('dashboard.apiOk', { stage: health.data.stage, version: health.data.version })}</span>
              ) : health.isError ? (
                <span className="text-destructive">● {t('dashboard.apiDown')}</span>
              ) : (
                t('ui.loading')
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">{t('dashboard.contentOverview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                {CONTENT_STATUSES.map((s) => (
                  <TableHead key={s} className="text-right">
                    {t(`content.statuses.${s}`)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.data?.map((row) => (
                <TableRow key={row.kind}>
                  <TableCell className="font-medium">
                    <Link to="/content/$kind" params={{ kind: row.kind }} className="hover:underline">
                      {t(`content.kinds.${row.kind}`)}
                    </Link>
                  </TableCell>
                  {CONTENT_STATUSES.map((s) => (
                    <TableCell key={s} className="text-right tabular-nums">
                      {row.counts[s]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
