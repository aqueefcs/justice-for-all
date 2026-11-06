import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ROLES, type Role } from '@jfa/shared';
import { api, devAuth } from './lib';

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="mb-6 text-2xl font-bold text-navy-900">{children}</h1>;
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>;
}

export function Dashboard() {
  const { t } = useTranslation();
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/health');
      if (error || !data) throw new Error('down');
      return data;
    },
  });
  return (
    <>
      <PageTitle>{t('dashboard.welcome')}</PageTitle>
      <Panel>
        <h2 className="mb-2 font-semibold">{t('dashboard.apiStatus')}</h2>
        {health.isLoading ? <p>{t('common:loading')}</p> : null}
        {health.data ? (
          <p className="text-green-700">{t('dashboard.apiOk', { stage: health.data.stage, version: health.data.version })}</p>
        ) : null}
        {health.isError ? <p className="text-red-700">{t('dashboard.apiDown')}</p> : null}
      </Panel>
    </>
  );
}

export function GuidesPage() {
  const { t } = useTranslation();
  const guides = useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/content/guides', { params: { query: { limit: 50 } } });
      if (error || !data) throw new Error('failed');
      return data;
    },
  });
  return (
    <>
      <PageTitle>{t('content.guides')}</PageTitle>
      {/* TODO(Phase 1): create/edit form (react-hook-form + zod + TipTap), locale tabs, submit-for-review button */}
      <Panel>
        {guides.isError ? <p className="text-red-700">{t('common:errorGeneric')}</p> : null}
        {guides.data && guides.data.items.length === 0 ? <p>{t('content.empty')}</p> : null}
        {guides.data && guides.data.items.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-slate-500">
                <th className="py-2">Slug</th>
                <th>{t('content.status')}</th>
                <th>{t('content.updated')}</th>
              </tr>
            </thead>
            <tbody>
              {guides.data.items.map((g) => (
                <tr key={g.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{g.translations.en?.title ?? g.slug}</td>
                  <td>{t(`content.statuses.${g.status}`)}</td>
                  <td className="text-sm text-slate-500">{new Date(g.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </>
  );
}

export function IntegrationsPage() {
  const { t } = useTranslation();
  const list = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/integrations');
      if (error || !data) throw new Error('failed');
      return data;
    },
  });
  return (
    <>
      <PageTitle>{t('integrations.title')}</PageTitle>
      <Panel>
        {list.isError ? <p className="text-red-700">{t('common:errorGeneric')}</p> : null}
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-slate-500">
              <th className="py-2">{t('integrations.name')}</th>
              <th>{t('integrations.provider')}</th>
              <th>{t('integrations.phase')}</th>
              <th>{t('integrations.configured')}</th>
            </tr>
          </thead>
          <tbody>
            {list.data?.map((i) => (
              <tr key={i.name} className="border-b last:border-0">
                <td className="py-2 font-medium">{i.name}</td>
                <td>{i.provider}</td>
                <td>{i.phase}</td>
                <td>
                  {i.configured ? (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">✓</span>
                  ) : (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">{t('integrations.notConfigured')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle>{t(titleKey)}</PageTitle>
      <Panel>
        <p className="text-slate-600">{t('placeholder')}</p>
      </Panel>
    </>
  );
}

export function DevLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('reviewer');
  return (
    <div className="mx-auto mt-24 max-w-md">
      <Panel>
        <h1 className="mb-2 text-xl font-bold">{t('devLogin.title')}</h1>
        <p className="mb-4 text-sm text-slate-600">{t('devLogin.note')}</p>
        <label className="mb-1 block font-medium" htmlFor="role">{t('devLogin.role')}</label>
        <select id="role" className="mb-4 w-full rounded border p-2" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          className="w-full rounded bg-primary px-4 py-2 font-semibold text-white"
          onClick={() => {
            devAuth.set(role);
            void navigate({ to: '/' });
          }}
        >
          {t('devLogin.signIn')}
        </button>
      </Panel>
    </div>
  );
}
