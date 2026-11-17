import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

/**
 * CMS workflow for every content type (test-only dev auth: x-dev-role + x-dev-user):
 * create → submit → author can't approve → another reviewer approves → publish packs;
 * review queue, summary and HTML sanitising.
 */
let mongo: MongoMemoryReplSet;
let app: NestFastifyApplication;

const LAWYER = { role: 'lawyer', user: 'lawyer-1' };
const REVIEWER_A = { role: 'reviewer', user: 'reviewer-a' };
const REVIEWER_B = { role: 'reviewer', user: 'reviewer-b' };
type Actor = { role: string; user: string };

async function call(method: 'GET' | 'POST' | 'PATCH', url: string, actor?: Actor, payload?: unknown) {
  const res = await app.inject({
    method,
    url,
    headers: actor ? { 'x-dev-role': actor.role, 'x-dev-user': actor.user } : {},
    ...(payload !== undefined ? { payload: payload as object } : {}),
  });
  return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : undefined };
}

const SAMPLES: Record<string, unknown> = {
  guides: {
    slug: 'workflow-guide',
    type: 'fir',
    categorySlug: 'police-fir',
    translations: { en: { title: 'Workflow guide', summary: 'S', steps: [{ title: 'One', body: 'Body' }] } },
  },
  articles: {
    slug: 'workflow-article',
    categorySlug: 'rights',
    translations: { en: { title: 'Workflow article', summary: 'S', body: '<p>Safe</p>' } },
  },
  templates: {
    slug: 'workflow-template',
    categorySlug: 'rights',
    fields: [{ key: 'name', type: 'text', required: true }],
    translations: { en: { title: 'Workflow template', summary: 'S', fieldLabels: { name: 'Name' }, bodyHtml: '<p>Hello {{name}}</p>' } },
  },
  categories: {
    slug: 'workflow-category',
    icon: 'ribbon',
    order: 9,
    translations: { en: { title: 'Workflow category' } },
  },
};

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ launchTimeout: 90_000 }] });
  Object.assign(process.env, {
    STAGE: 'test',
    MONGODB_URI: mongo.getUri('jfa-content-test'),
    ALLOW_DEV_AUTH: 'true',
    SWAGGER_ENABLED: 'false',
    LOG_LEVEL: 'error',
    ORIGIN_VERIFY_SECRET: '',
  });
  const { createApp } = await import('../src/app.factory.js');
  app = await createApp();
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

afterAll(async () => {
  await app?.close();
  await mongo?.stop();
});

describe.each(Object.keys(SAMPLES))('workflow: %s', (kind) => {
  it('create → submit → four-eyes → approve', async () => {
    const created = await call('POST', `/v1/content/${kind}`, LAWYER, SAMPLES[kind]);
    expect(created.status).toBe(201);
    expect(created.body.status).toBe('draft');
    const id = created.body.id as string;

    // drafts can be edited
    const edited = await call('PATCH', `/v1/content/${kind}/${id}`, LAWYER, { slug: `${(SAMPLES[kind] as { slug: string }).slug}-v2` });
    expect(edited.status).toBe(200);

    expect((await call('POST', `/v1/content/${kind}/${id}/status`, LAWYER, { status: 'in_review' })).status).toBe(200);
    // in review: no more edits
    expect((await call('PATCH', `/v1/content/${kind}/${id}`, LAWYER, { slug: 'nope-nope' })).status).toBe(409);

    // a reviewer who authored it cannot approve it (four-eyes)
    const authoredByA = await call('POST', `/v1/content/${kind}`, REVIEWER_A, { ...(SAMPLES[kind] as object), slug: `${kind}-by-a` });
    await call('POST', `/v1/content/${kind}/${authoredByA.body.id}/status`, REVIEWER_A, { status: 'in_review' });
    expect((await call('POST', `/v1/content/${kind}/${authoredByA.body.id}/status`, REVIEWER_A, { status: 'published' })).status).toBe(403);
    expect((await call('POST', `/v1/content/${kind}/${authoredByA.body.id}/status`, REVIEWER_B, { status: 'published' })).status).toBe(200);

    // lawyers can't publish; another reviewer can
    expect((await call('POST', `/v1/content/${kind}/${id}/status`, LAWYER, { status: 'published' })).status).toBe(403);
    const published = await call('POST', `/v1/content/${kind}/${id}/status`, REVIEWER_B, { status: 'published' });
    expect(published.status).toBe(200);
    expect(published.body.version).toBe(2);
    expect(published.body.reviewerId).toBe('reviewer-b');
  });
});

describe('review queue and summary', () => {
  it('lists in-review items across types, for reviewers only', async () => {
    const draft = await call('POST', '/v1/content/articles', LAWYER, { ...(SAMPLES.articles as object), slug: 'queued-article' });
    await call('POST', `/v1/content/articles/${draft.body.id}/status`, LAWYER, { status: 'in_review' });

    expect((await call('GET', '/v1/content/review-queue', LAWYER)).status).toBe(403);
    const queue = await call('GET', '/v1/content/review-queue', REVIEWER_A);
    expect(queue.status).toBe(200);
    expect(queue.body.items).toContainEqual(expect.objectContaining({ kind: 'articles', slug: 'queued-article', authorId: 'lawyer-1' }));
  });

  it('summarises counts per type and status', async () => {
    const res = await call('GET', '/v1/content/summary', LAWYER);
    expect(res.status).toBe(200);
    const articles = res.body.kinds.find((k: { kind: string }) => k.kind === 'articles');
    expect(articles.counts.in_review).toBeGreaterThanOrEqual(1);
    expect(articles.counts.published).toBeGreaterThanOrEqual(1);
  });

  it('citizens cannot use the CMS', async () => {
    expect((await call('GET', '/v1/content/templates', { role: 'citizen', user: 'c-1' })).status).toBe(403);
  });
});

describe('live version stays in the app while re-editing', () => {
  async function publishedGuideTitles(): Promise<string[]> {
    const res = await call('POST', '/v1/publishing/packs', REVIEWER_A, { locales: ['en'] });
    expect(res.status).toBe(200);
    const { readFile } = await import('node:fs/promises');
    const pack = JSON.parse(await readFile(res.body.manifest.packs[0].url, 'utf8'));
    return pack.guides.map((g: { title: string }) => g.title);
  }

  it('builds packs from the approved snapshot; archiving removes it', async () => {
    const created = await call('POST', '/v1/content/guides', LAWYER, {
      ...(SAMPLES.guides as object),
      slug: 'snapshot-guide',
      translations: { en: { title: 'Approved title', summary: 'S', steps: [{ title: 'One', body: 'Body' }] } },
    });
    const id = created.body.id as string;
    await call('POST', `/v1/content/guides/${id}/status`, LAWYER, { status: 'in_review' });
    await call('POST', `/v1/content/guides/${id}/status`, REVIEWER_A, { status: 'published' });
    expect(await publishedGuideTitles()).toContain('Approved title');

    // Re-open for editing: the approved version must stay live
    expect((await call('POST', `/v1/content/guides/${id}/status`, LAWYER, { status: 'draft' })).status).toBe(200);
    await call('PATCH', `/v1/content/guides/${id}`, LAWYER, {
      translations: { en: { title: 'Unreviewed new title', summary: 'S', steps: [{ title: 'One', body: 'Body' }] } },
    });
    const titles = await publishedGuideTitles();
    expect(titles).toContain('Approved title');
    expect(titles).not.toContain('Unreviewed new title');

    // Archive: gone from the app
    expect((await call('POST', `/v1/content/guides/${id}/status`, LAWYER, { status: 'archived' })).status).toBe(200);
    expect(await publishedGuideTitles()).not.toContain('Approved title');
  });
});

describe('sanitising', () => {
  it('strips scripts, event handlers and javascript: links from article bodies', async () => {
    const res = await call('POST', '/v1/content/articles', LAWYER, {
      slug: 'xss-article',
      categorySlug: 'rights',
      translations: {
        en: {
          title: 'XSS',
          summary: 'S',
          body: '<p>Ok</p><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">x</a><a href="https://indiacode.nic.in">ok</a>',
        },
      },
    });
    expect(res.status).toBe(201);
    const body = res.body.translations.en.body as string;
    expect(body).toContain('<p>Ok</p>');
    expect(body).not.toMatch(/script|onerror|javascript:|<img/i);
    expect(body).toContain('href="https://indiacode.nic.in"');
  });

  it('keeps template placeholders and safe styles, drops unsafe ones', async () => {
    const res = await call('POST', '/v1/content/templates', LAWYER, {
      slug: 'xss-template',
      categorySlug: 'rights',
      fields: [{ key: 'name', type: 'text', required: true }],
      translations: {
        en: {
          title: 'T',
          summary: 'S',
          fieldLabels: { name: 'Name' },
          bodyHtml: '<div style="font-size:14px;position:fixed;background:url(x)">Dear {{name}}</div><script>x</script>',
        },
      },
    });
    expect(res.status).toBe(201);
    const html = res.body.translations.en.bodyHtml as string;
    expect(html).toContain('{{name}}');
    expect(html).toContain('font-size:14px');
    expect(html).not.toMatch(/position|background|script/i);
  });
});
