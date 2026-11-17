import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useT } from '@/components/form-fields';
import { api } from '@/lib/api';
import { authClient, useCurrentUser } from '@/lib/auth';

export function IntegrationsPage() {
  const t = useT();
  const list = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/integrations');
      if (error || !data) throw new Error('integrations');
      return data;
    },
  });
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">{t('integrations.title')}</h1>
      <div className="rounded-lg border bg-card">
        {list.isError ? <p className="p-6 text-destructive">{t('ui.error')}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('integrations.name')}</TableHead>
              <TableHead>{t('integrations.provider')}</TableHead>
              <TableHead>{t('integrations.phase')}</TableHead>
              <TableHead>{t('integrations.configured')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.data?.map((i) => (
              <TableRow key={i.name}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell>{i.provider}</TableCell>
                <TableCell>{i.phase}</TableCell>
                <TableCell>
                  {i.configured ? (
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900">
                      ✓ {t('integrations.configured')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
                      {t('integrations.notConfigured')}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function AccountPage() {
  const t = useT();
  const { user } = useCurrentUser();
  const [busy, setBusy] = useState(false);

  const onChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    const { error } = await authClient.changePassword({
      currentPassword: String(form.get('current')),
      newPassword: String(form.get('next')),
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (error) return void toast.error(error.message ?? t('ui.error'));
    formEl.reset();
    toast.success(t('auth.passwordChanged'));
  };

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">{t('nav.account')}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">{user?.name}</CardTitle>
          <CardDescription>
            {user?.email} · {user ? t(`team.roles.${user.role}`) : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4 text-emerald-700" /> {t('auth.setupDone')}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">{t('auth.changePassword')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current">{t('auth.currentPassword')}</Label>
              <Input id="current" name="current" type="password" autoComplete="current-password" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="next">{t('auth.newPassword')}</Label>
              <Input id="next" name="next" type="password" autoComplete="new-password" minLength={12} required />
            </div>
            <Button type="submit" disabled={busy} className="self-start">
              {t('auth.changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
