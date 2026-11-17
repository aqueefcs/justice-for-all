import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound, Plus, UserX, UserCheck } from 'lucide-react';
import type { Role } from '@jfa/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useT } from '@/components/form-fields';
import { authClient, can, toSessionUser, useCurrentUser } from '@/lib/auth';

/** 16-character one-time password, shared privately with the new staff member. */
function tempPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, (c) => ({ '+': 'x', '/': 'y', '=': '' })[c]!);
}

type Staff = ReturnType<typeof toSessionUser> & { banned?: boolean };

export function TeamPage() {
  const t = useT();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [shownPassword, setShownPassword] = useState<{ email: string; password: string }>();
  const assignable = can.assignableRoles(user);

  const staff = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({ query: { limit: 200, sortBy: 'createdAt', sortDirection: 'desc' } });
      if (error) throw new Error(error.message ?? 'list users');
      return (data?.users ?? [])
        .map((u) => ({ ...toSessionUser(u as unknown as Record<string, unknown>)!, banned: Boolean(u.banned) }))
        .filter((u) => u.role !== 'citizen') as Staff[];
    },
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['team'] });

  const act = useMutation({
    mutationFn: async (fn: () => Promise<{ error: { message?: string } | null }>) => {
      const { error } = await fn();
      if (error) throw new Error(error.message ?? t('ui.error'));
    },
    onSuccess: () => void refresh(),
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{t('team.title')}</h1>
          <p className="text-muted-foreground">{t('team.subtitle')}</p>
        </div>
        <AddStaffDialog assignable={assignable} onCreated={(email, password) => { setShownPassword({ email, password }); void refresh(); }} />
      </div>

      {shownPassword ? (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <KeyRound className="size-4" />
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{t('team.tempPassword', shownPassword)}</span>
            <Button size="sm" variant="outline" onClick={() => setShownPassword(undefined)}>
              {t('ui.cancel')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('team.name')}</TableHead>
              <TableHead>{t('team.email')}</TableHead>
              <TableHead>{t('team.role')}</TableHead>
              <TableHead>{t('team.twoFactor')}</TableHead>
              <TableHead className="text-right">{t('ui.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.data?.map((member) => {
              const self = member.id === user?.id;
              const editable = !self && assignable.includes(member.role);
              return (
                <TableRow key={member.id} className={member.banned ? 'opacity-60' : undefined}>
                  <TableCell className="font-medium">
                    {member.name} {self ? <Badge variant="secondary">{t('ui.you')}</Badge> : null}
                    {member.banned ? <Badge variant="outline">{t('team.disabled')}</Badge> : null}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {editable ? (
                      <Select
                        value={member.role}
                        onValueChange={(role) => act.mutate(() => authClient.admin.setRole({ userId: member.id, role: role as never }))}
                      >
                        <SelectTrigger className="w-44" aria-label={t('team.role')}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assignable.map((r) => (
                            <SelectItem key={r} value={r}>
                              {t(`team.roles.${r}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      t(`team.roles.${member.role}`)
                    )}
                  </TableCell>
                  <TableCell>{member.twoFactorEnabled ? t('team.on') : <span className="text-amber-700">{t('team.off')}</span>}</TableCell>
                  <TableCell className="text-right">
                    {editable ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const password = tempPassword();
                            act.mutate(async () => {
                              const res = await authClient.admin.setUserPassword({ userId: member.id, newPassword: password });
                              if (!res.error) setShownPassword({ email: member.email, password });
                              return res;
                            });
                          }}
                        >
                          <KeyRound className="size-4" /> {t('team.resetPassword')}
                        </Button>
                        {member.banned ? (
                          <Button size="sm" variant="ghost" onClick={() => act.mutate(() => authClient.admin.unbanUser({ userId: member.id }))}>
                            <UserCheck className="size-4" /> {t('team.enable')}
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => act.mutate(() => authClient.admin.banUser({ userId: member.id }))}>
                            <UserX className="size-4" /> {t('team.disable')}
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AddStaffDialog({ assignable, onCreated }: { assignable: Role[]; onCreated: (email: string, password: string) => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>('lawyer');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email')).trim().toLowerCase();
    const password = tempPassword();
    setBusy(true);
    const { error } = await authClient.admin.createUser({ email, name: String(form.get('name')).trim(), password, role: role as never });
    setBusy(false);
    if (error) return void toast.error(error.message ?? t('ui.error'));
    toast.success(t('team.created'));
    setOpen(false);
    onCreated(email, password);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> {t('team.add')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t('team.add')}</DialogTitle>
            <DialogDescription>{t('team.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="staff-name">{t('team.name')}</Label>
            <Input id="staff-name" name="name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="staff-email">{t('team.email')}</Label>
            <Input id="staff-email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="staff-role">{t('team.role')}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="staff-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignable.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`team.roles.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {t('ui.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
