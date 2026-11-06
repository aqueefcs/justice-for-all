// Writes apps/api/openapi.json without a database (lazy Mongo connection).
// Used by `pnpm --filter @jfa/api-client generate`. Requires `pnpm --filter @jfa/api build` first.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
process.env.OPENAPI_EXPORT = '1';
process.env.STAGE ??= 'local';
process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:1/openapi-export';
process.env.SWAGGER_ENABLED = 'false';
process.env.LOG_LEVEL = 'error';

const require = createRequire(import.meta.url);
const { createApp, buildOpenApi } = require(join(here, '..', 'dist', 'app.factory.js'));

const app = await createApp();
await app.init();
const doc = buildOpenApi(app);
const out = join(here, '..', 'openapi.json');
writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
await app.close();
console.log(`✓ OpenAPI written to ${out}`);
process.exit(0);
