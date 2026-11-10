// Local MongoDB without Docker: a single-node replica set on :27017 using the mongod binary
// that mongodb-memory-server already downloaded. Data persists in <repo>/.data/mongo.
// Usage: pnpm db:local   (Ctrl+C to stop). Docker alternative: pnpm db:up
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

const dbPath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.data', 'mongo');
mkdirSync(dbPath, { recursive: true });

const rs = await MongoMemoryReplSet.create({
  replSet: { count: 1, name: 'rs0', storageEngine: 'wiredTiger' },
  instanceOpts: [{ port: 27017, dbPath, launchTimeout: 90_000 }],
});
console.log(`✓ MongoDB replica set running: ${rs.getUri('jfa')}`);
console.log(`  data: ${dbPath}  (Ctrl+C to stop)`);

const stop = async () => {
  await rs.stop({ doCleanup: false, force: false });
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
