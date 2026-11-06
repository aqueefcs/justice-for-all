import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { devAuth, queryClient } from './lib';
import { Dashboard, DevLogin, GuidesPage, IntegrationsPage, PlaceholderPage } from './pages';

const NAV = [
  { to: '/', key: 'nav.dashboard' },
  { to: '/content', key: 'nav.content' },
  { to: '/review', key: 'nav.review' },
  { to: '/lawyers', key: 'nav.lawyers' },
  { to: '/users', key: 'nav.users' },
  { to: '/integrations', key: 'nav.integrations' },
  { to: '/settings', key: 'nav.settings' },
] as const;

function Shell() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 bg-navy-900 p-4 text-white">
        <div className="mb-6 text-lg font-bold">{t('title')}</div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded px-3 py-2 text-slate-200 hover:bg-navy-800"
              activeProps={{ className: 'bg-navy-800 font-semibold text-white' }}
              activeOptions={{ exact: n.to === '/' }}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>
        <div className="mt-8 text-xs text-slate-400">
          role: {devAuth.get() ?? '—'}{' '}
          <button className="underline" onClick={() => { devAuth.clear(); location.assign('/login'); }}>
            ×
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({ component: Outlet });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: DevLogin });
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: Shell,
  // TODO(Phase 1): check the Better Auth session instead of the dev role.
  beforeLoad: () => {
    if (!devAuth.get()) throw redirect({ to: '/login' });
  },
});
const parent = () => appRoute;
const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    createRoute({ getParentRoute: parent, path: '/', component: Dashboard }),
    createRoute({ getParentRoute: parent, path: '/content', component: GuidesPage }),
    createRoute({ getParentRoute: parent, path: '/review', component: () => <PlaceholderPage titleKey="nav.review" /> }),
    createRoute({ getParentRoute: parent, path: '/lawyers', component: () => <PlaceholderPage titleKey="nav.lawyers" /> }),
    createRoute({ getParentRoute: parent, path: '/users', component: () => <PlaceholderPage titleKey="nav.users" /> }),
    createRoute({ getParentRoute: parent, path: '/integrations', component: IntegrationsPage }),
    createRoute({ getParentRoute: parent, path: '/settings', component: () => <PlaceholderPage titleKey="nav.settings" /> }),
  ]),
]);

const router = createRouter({ routeTree });
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
