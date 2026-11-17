import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, createRoute, createRouter, Navigate, Outlet, RouterProvider } from '@tanstack/react-router';
import './styles.css';
import './lib/i18n';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import { queryClient } from '@/lib/api';
import { isKind } from '@/lib/content-kinds';
import { LoginPage, SetupTwoFactorPage } from '@/routes/auth-pages';
import { ContentEditor } from '@/routes/content-editor';
import { ContentList } from '@/routes/content-list';
import { Dashboard } from '@/routes/dashboard';
import { AccountPage, IntegrationsPage } from '@/routes/other-pages';
import { ReviewQueue } from '@/routes/review';
import { TeamPage } from '@/routes/team';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const setupRoute = createRoute({ getParentRoute: () => rootRoute, path: '/setup-2fa', component: SetupTwoFactorPage });
const appRoute = createRoute({ getParentRoute: () => rootRoute, id: 'app', component: AppShell });

const app = () => appRoute;
const dashboardRoute = createRoute({ getParentRoute: app, path: '/', component: Dashboard });
const contentListRoute = createRoute({
  getParentRoute: app,
  path: '/content/$kind',
  component: function ContentListPage() {
    const { kind } = contentListRoute.useParams();
    return isKind(kind) ? <ContentList kind={kind} /> : <Navigate to="/content/$kind" params={{ kind: 'guides' }} />;
  },
});
const contentNewRoute = createRoute({
  getParentRoute: app,
  path: '/content/$kind/new',
  component: function ContentNewPage() {
    const { kind } = contentNewRoute.useParams();
    return isKind(kind) ? <ContentEditor key={`${kind}-new`} kind={kind} /> : <Navigate to="/" />;
  },
});
const contentEditRoute = createRoute({
  getParentRoute: app,
  path: '/content/$kind/$id',
  component: function ContentEditPage() {
    const { kind, id } = contentEditRoute.useParams();
    return isKind(kind) ? <ContentEditor key={`${kind}-${id}`} kind={kind} id={id} /> : <Navigate to="/" />;
  },
});
const reviewRoute = createRoute({ getParentRoute: app, path: '/review', component: ReviewQueue });
const teamRoute = createRoute({ getParentRoute: app, path: '/team', component: TeamPage });
const integrationsRoute = createRoute({ getParentRoute: app, path: '/integrations', component: IntegrationsPage });
const accountRoute = createRoute({ getParentRoute: app, path: '/account', component: AccountPage });

const routeTree = rootRoute.addChildren([
  loginRoute,
  setupRoute,
  appRoute.addChildren([
    dashboardRoute,
    contentListRoute,
    contentNewRoute,
    contentEditRoute,
    reviewRoute,
    teamRoute,
    integrationsRoute,
    accountRoute,
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
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
