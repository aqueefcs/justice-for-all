import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

/**
 * End-to-end tests against an in-memory MongoDB replica set.
 * Covers: health, default-deny auth, RBAC, validation, NoSQL injection, review workflow.
 */
let mongo: MongoMemoryReplSet;
let app: NestFastifyApplication;

const guide = {
  slug: 'test-guide',
  type: 'fir',
  categorySlug: 'police-fir',
  translations: { en: { title: 'Test', summary: 'Summary', steps: [{ title: 'Step', body: 'Body' }] } },
};

async function call(method: 'GET' | 'POST' | 'PATCH', url: string, role?: string, payload?: unknown) {
  const res = await app.inject({
    method,
    url,
    headers: role ? { 'x-dev-role': role } : {},
    ...(payload !== undefined ? { payload: payload as object } : {}),
  });
  return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : undefined };
}

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    instanceOpts: [{ launchTimeout: 90_000 }], // first start on Windows can be slow (AV scan)
  });
  Object.assign(process.env, {
    STAGE: 'test',
    MONGODB_URI: mongo.getUri('jfa-test'),
    ALLOW_DEV_AUTH: 'true',
    SWAGGER_ENABLED: 'false',
    LOG_LEVEL: 'error',
    ORIGIN_VERIFY_SECRET: '',
  });
  // Imported after env is set: ConfigModule validates env when the module is loaded.
  const { createApp } = await import('../src/app.factory.js');
  app = await createApp();
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

afterAll(async () => {
  await app?.close();
  await mongo?.stop();
});

describe('health', () => {
  it('is public and does not need the DB', async () => {
    const res = await call('GET', '/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('auth & RBAC', () => {
  it('rejects unauthenticated requests (default-deny)', async () => {
    expect((await call('GET', '/v1/content/guides')).status).toBe(401);
  });
  it('rejects citizens from the CMS', async () => {
    expect((await call('GET', '/v1/content/guides', 'citizen')).status).toBe(403);
  });
  it('allows lawyers to list guides', async () => {
    const res = await call('GET', '/v1/content/guides', 'lawyer');
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });
  it('restricts integrations status to admins', async () => {
    expect((await call('GET', '/v1/integrations', 'lawyer')).status).toBe(403);
    const res = await call('GET', '/v1/integrations', 'admin');
    expect(res.status).toBe(200);
    expect(res.body.map((i: { name: string }) => i.name)).toContain('payments');
  });
});

describe('validation & injection', () => {
  it('returns VALIDATION_FAILED for bad payloads', async () => {
    const res = await call('POST', '/v1/content/guides', 'lawyer', { slug: 'Bad Slug' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
  });
  it('rejects $-operator payloads', async () => {
    const res = await call('POST', '/v1/content/guides', 'lawyer', { ...guide, slug: { $ne: null } });
    expect(res.status).toBe(400);
  });
});

describe('review workflow', () => {
  it('draft → in_review → published (reviewer, not author) → pack', async () => {
    const created = await call('POST', '/v1/content/guides', 'lawyer', guide);
    expect(created.status).toBe(201);
    expect(created.body.status).toBe('draft');
    const id = created.body.id as string;

    // cannot jump straight to published
    expect((await call('POST', `/v1/content/guides/${id}/status`, 'lawyer', { status: 'published' })).status).toBe(409);

    expect((await call('POST', `/v1/content/guides/${id}/status`, 'lawyer', { status: 'in_review' })).status).toBe(200);
    // lawyers cannot publish
    expect((await call('POST', `/v1/content/guides/${id}/status`, 'lawyer', { status: 'published' })).status).toBe(403);

    const published = await call('POST', `/v1/content/guides/${id}/status`, 'reviewer', { status: 'published' });
    expect(published.status).toBe(200);
    expect(published.body.version).toBe(2);

    // publishing packs runs inline when SQS is not configured
    const packs = await call('POST', '/v1/publishing/packs', 'reviewer', { locales: ['en'] });
    expect(packs.status).toBe(200);
    expect(packs.body.queued).toBe(false);
    expect(packs.body.manifest.packs[0].locale).toBe('en');
  });
});
