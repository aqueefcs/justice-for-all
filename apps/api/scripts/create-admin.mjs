// Creates the FIRST super_admin account (everyone else is added from the admin console's Team page).
// Usage:  pnpm --filter @jfa/api build
//         pnpm --filter @jfa/api create-admin -- --email you@example.in --name "Your Name"
// Uses the same config as the API (.env locally, SSM on AWS). Prints a one-time password:
// sign in with it, set up two-step verification, then change the password.
import { randomBytes } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dist = (p) => join(here, '..', 'dist', p);

const { values } = parseArgs({
  options: { email: { type: 'string' }, name: { type: 'string' }, role: { type: 'string', default: 'super_admin' } },
});
if (!values.email || !values.name) {
  console.error('Usage: create-admin -- --email you@example.in --name "Your Name" [--role super_admin|admin]');
  process.exit(1);
}
if (!['super_admin', 'admin'].includes(values.role)) {
  console.error('--role must be super_admin or admin');
  process.exit(1);
}

process.env.LOG_LEVEL = 'error';
const { loadSsmParameters } = require(dist('config/load-ssm.js'));
await loadSsmParameters();

const { NestFactory } = require('@nestjs/core');
const { applyMongooseSafety } = require('@jfa/db');
const { AppModule } = require(dist('app.module.js'));
const { AUTH_INSTANCE } = require(dist('auth/better-auth.js'));
const { createStaffUser } = require(dist('auth/staff-users.js'));

applyMongooseSafety();
const ctx = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
try {
  const password = randomBytes(12).toString('base64url'); // 16 chars, shown once
  const { id } = await createStaffUser(ctx.get(AUTH_INSTANCE), {
    email: values.email,
    name: values.name,
    role: values.role,
    password,
  });
  console.log(`✓ Created ${values.role} ${values.email} (id ${id})`);
  console.log(`  One-time password: ${password}`);
  console.log('  Sign in to the admin console, set up two-step verification, then change this password.');
} catch (err) {
  console.error(`✗ ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
} finally {
  await ctx.close();
}
