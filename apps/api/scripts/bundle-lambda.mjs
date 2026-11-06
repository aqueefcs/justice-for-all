// Bundles the compiled API (dist/, built by `nest build` with decorator metadata) into
// self-contained Lambda artifacts:
//   .lambda/api/     main.js + run.sh   (HTTP API via AWS Lambda Web Adapter)
//   .lambda/worker/  index.js           (SQS worker handler: index.handler)
// We bundle the tsc output rather than the TS source because esbuild cannot emit decorator metadata.
import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '.lambda');
rmSync(out, { recursive: true, force: true });

// Optional peer modules that Nest/Mongo load lazily inside try/catch — safe to leave out.
const external = [
  '@nestjs/microservices',
  '@nestjs/microservices/*',
  '@nestjs/websockets',
  '@nestjs/websockets/*',
  '@nestjs/platform-express',
  'class-transformer',
  'class-transformer/*',
  'class-validator',
  '@fastify/view',
  'kerberos',
  'snappy',
  '@mongodb-js/zstd',
  'mongodb-client-encryption',
  'gcp-metadata',
  'socks',
  'aws4',
  '@aws-sdk/credential-providers',
];

const common = {
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'cjs',
  minify: true,
  sourcemap: true,
  keepNames: true, // Nest relies on class names for DI tokens
  external,
  logLevel: 'info',
};

mkdirSync(join(out, 'api'), { recursive: true });
await build({ ...common, entryPoints: [join(root, 'dist', 'main.js')], outfile: join(out, 'api', 'main.js') });
cpSync(join(root, 'lambda', 'run.sh'), join(out, 'api', 'run.sh'));
try { chmodSync(join(out, 'api', 'run.sh'), 0o755); } catch { /* Windows */ }

mkdirSync(join(out, 'worker'), { recursive: true });
await build({ ...common, entryPoints: [join(root, 'dist', 'worker.js')], outfile: join(out, 'worker', 'index.js') });

console.log('✓ Lambda bundles written to apps/api/.lambda/');
