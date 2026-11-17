import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { totpFromUri } from './totp';

/**
 * Real sign-in flow through Better Auth (no x-dev-role): email + password, mandatory
 * two-factor for staff, role checks, and that public sign-up is disabled.
 */
let mongo: MongoMemoryReplSet;
let app: NestFastifyApplication;

const PASSWORD = 'correct horse battery staple';

type Res = { status: number; body: any; cookies: string };

/** Keeps a cookie jar per "browser" so each user has their own session. */
class Browser {
  private jar = new Map<string, string>();

  async call(method: 'GET' | 'POST', url: string, payload?: unknown): Promise<Res> {
    const res = await app.inject({
      method,
      url,
      headers: {
        origin: 'http://localhost:5173',
        ...(this.jar.size ? { cookie: [...this.jar].map(([k, v]) => `${k}=${v}`).join('; ') } : {}),
      },
      ...(payload !== undefined ? { payload: payload as object } : {}),
    });
    const setCookie = res.headers['set-cookie'];
    for (const c of Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : []) {
      const [pair] = c.split(';');
      const eq = pair!.indexOf('=');
      const name = pair!.slice(0, eq);
      const value = pair!.slice(eq + 1);
      if (value) this.jar.set(name, value);
      else this.jar.delete(name);
    }
    let body: unknown;
    try {
      body = res.body ? JSON.parse(res.body) : undefined;
    } catch {
      body = res.body;
    }
    return { status: res.statusCode, body, cookies: [...this.jar.keys()].join(',') };
  }
}

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ launchTimeout: 90_000 }] });
  Object.assign(process.env, {
    STAGE: 'test',
    MONGODB_URI: mongo.getUri('jfa-auth-test'),
    ALLOW_DEV_AUTH: 'false',
    SWAGGER_ENABLED: 'false',
    LOG_LEVEL: 'error',
    ORIGIN_VERIFY_SECRET: '',
    CORS_ORIGINS: 'http://localhost:5173',
    BETTER_AUTH_URL: 'http://localhost:3000',
  });
  const { createApp } = await import('../src/app.factory.js');
  const { AUTH_INSTANCE } = await import('../src/auth/better-auth.js');
  const { createStaffUser } = await import('../src/auth/staff-users.js');
  app = await createApp();
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const auth = app.get(AUTH_INSTANCE);
  await createStaffUser(auth, { email: 'lawyer@example.in', name: 'Lawyer One', role: 'lawyer', password: PASSWORD });
  await createStaffUser(auth, { email: 'citizen@example.in', name: 'Citizen', role: 'citizen', password: PASSWORD });
});

afterAll(async () => {
  await app?.close();
  await mongo?.stop();
});

describe('Better Auth', () => {
  it('has no public sign-up', async () => {
    const res = await new Browser().call('POST', '/v1/auth/sign-up/email', {
      email: 'stranger@example.in',
      password: PASSWORD,
      name: 'Stranger',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects a wrong password', async () => {
    const res = await new Browser().call('POST', '/v1/auth/sign-in/email', { email: 'lawyer@example.in', password: 'nope-nope-nope' });
    expect(res.status).toBe(401);
  });

  it('staff must enable two-factor before using the CMS, then it works', async () => {
    const b = new Browser();
    const signIn = await b.call('POST', '/v1/auth/sign-in/email', { email: 'lawyer@example.in', password: PASSWORD });
    expect(signIn.status).toBe(200);

    // Signed in, but no 2FA yet → blocked from staff routes
    const blocked = await b.call('GET', '/v1/content/guides');
    expect(blocked.status).toBe(403);
    expect(blocked.body.code).toBe('TWO_FACTOR_REQUIRED');

    // Set up TOTP like an authenticator app would
    const enable = await b.call('POST', '/v1/auth/two-factor/enable', { password: PASSWORD });
    expect(enable.status).toBe(200);
    expect(enable.body.totpURI).toMatch(/^otpauth:\/\/totp\//);
    expect(enable.body.backupCodes.length).toBeGreaterThan(0);

    const verify = await b.call('POST', '/v1/auth/two-factor/verify-totp', { code: totpFromUri(enable.body.totpURI) });
    expect(verify.status).toBe(200);

    const allowed = await b.call('GET', '/v1/content/guides');
    expect(allowed.status).toBe(200);

    // Fresh sign-in now requires the second factor
    const b2 = new Browser();
    const second = await b2.call('POST', '/v1/auth/sign-in/email', { email: 'lawyer@example.in', password: PASSWORD });
    expect(second.status).toBe(200);
    expect(second.body.twoFactorRedirect).toBe(true);
    expect((await b2.call('GET', '/v1/content/guides')).status).toBe(401);
    const done = await b2.call('POST', '/v1/auth/two-factor/verify-totp', { code: totpFromUri(enable.body.totpURI) });
    expect(done.status).toBe(200);
    expect((await b2.call('GET', '/v1/content/guides')).status).toBe(200);
  });

  it('a citizen account cannot use the CMS', async () => {
    const b = new Browser();
    expect((await b.call('POST', '/v1/auth/sign-in/email', { email: 'citizen@example.in', password: PASSWORD })).status).toBe(200);
    const res = await b.call('GET', '/v1/content/guides');
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('x-dev-role is ignored when dev auth is off', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/content/guides', headers: { 'x-dev-role': 'admin' } });
    expect(res.statusCode).toBe(401);
  });
});
