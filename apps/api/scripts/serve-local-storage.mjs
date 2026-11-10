// Local stand-in for the Cloudflare R2 content CDN: serves apps/api/.local-storage over HTTP
// so a phone on the same Wi-Fi can download published content packs.
// Usage: pnpm --filter @jfa/api cdn:local   → http://<your-LAN-IP>:8090/packs/manifest.json
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '.local-storage');
const port = Number(process.env.CDN_PORT ?? 8090);

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const file = normalize(join(root, urlPath));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': file.endsWith('.json') ? 'application/json' : 'application/octet-stream',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, '0.0.0.0', () => console.log(`✓ Local content CDN on :${port} serving ${root}`));
