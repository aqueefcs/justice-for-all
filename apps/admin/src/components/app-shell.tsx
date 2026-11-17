import { Link, Navigate, Outlet, useNavigate } from '@tanstack/react-router';
import { FileText, Gauge, Inbox, LogOut, Plug, UserCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { authClient, can, useCurrentUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useT } from './form-fields';
import { PublishButton } from './publish-button';

/**
 * Signed-in layout. Guards every staff page: no session → sign in; citizen account → refused;
 * staff without two-step verification → setup page (the API enforces the same rules).
 */
export function AppShell() {
  const t = useT();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUser();

  if (isPending) return <div className="grid min-h-svh place-items-center text-muted-foreground">{t('ui.loading')}</div>;
  if (!user) return <Navigate to="/login" />;
  if (!user.twoFactorEnabled && user.role !== 'citizen') return <Navigate to="/setup-2fa" />;
  if (user.role === 'citizen') {
    return (
      <div className="grid min-h-svh place-items-center gap-4 p-6 text-center">
        <p>{t('auth.notStaff')}</p>
        <Button onClick={() => void authClient.signOut().then(() => navigate({ to: '/login' }))}>{t('ui.signOut')}</Button>
      </div>
    );
  }

  const nav = [
    { to: '/', label: t('nav.dashboard'), icon: Gauge, show: true, exact: true },
    { to: '/content/$kind', params: { kind: 'guides' }, label: t('nav.content'), icon: FileText, show: true, exact: false },
    { to: '/review', label: t('nav.review'), icon: Inbox, show: can.publish(user), exact: true },
    { to: '/team', label: t('nav.team'), icon: Users, show: can.manageTeam(user), exact: true },
    { to: '/integrations', label: t('nav.integrations'), icon: Plug, show: can.manageTeam(user), exact: true },
    { to: '/account', label: t('nav.account'), icon: UserCircle, show: true, exact: true },
  ] as const;

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col gap-4 bg-sidebar p-4 text-sidebar-foreground">
        <div className="flex items-center gap-3 px-2 py-1">
          <img src="/logo.png" alt="" className="size-9 rounded-xl" />
          <div className="leading-tight">
            <div className="font-heading font-semibold">Justice For All</div>
            <div className="text-xs text-sidebar-foreground/70">Admin</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {nav
            .filter((n) => n.show)
            .map((n) => (
              <Link
                key={n.to}
                to={n.to}
                params={'params' in n ? n.params : undefined}
                activeOptions={{ exact: n.exact, includeSearch: false }}
                className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}
                activeProps={{ className: 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground' }}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            ))}
        </nav>
        <div className="flex-1" />
        {can.publish(user) ? <PublishButton /> : null}
        <Separator className="bg-sidebar-border" />
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-medium">{user.name}</div>
            <div className="text-xs text-sidebar-foreground/70">{t(`team.roles.${user.role}`)}</div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('ui.signOut')}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => void authClient.signOut().then(() => navigate({ to: '/login' }))}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-muted/30 p-8">
        <Outlet />
      </main>
    </div>
  );
}
