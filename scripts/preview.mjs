import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { siteRoot } from './lib.mjs';

const root = siteRoot();
const portArg = process.argv.indexOf('--port');
const firstPort = portArg > 0 ? Number(process.argv[portArg + 1]) : 8300;

const mounts = [
  ['/media/', join(root, 'media')],
  ['/_private/', join(root, 'site', 'private')],
  ['/_templates/', join(root, 'site', 'templates')],
  ['/', join(root, 'site', 'public')],
];

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

function findFile(urlPath) {
  const [prefix, dir] = mounts.find(([p]) => urlPath.startsWith(p));
  const full = resolve(dir, decodeURIComponent(urlPath.slice(prefix.length)));
  if (full !== dir && !full.startsWith(dir + sep)) return null;
  for (const candidate of [full, join(full, 'index.html'), full + '.html']) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const server = createServer((req, res) => {
  let status = 200;
  let file = req.method === 'GET' || req.method === 'HEAD' ? findFile(new URL(req.url, 'http://x').pathname) : null;
  if (!file) {
    status = req.method === 'GET' || req.method === 'HEAD' ? 404 : 405;
    file = findFile('/404.html');
  }
  res.writeHead(status, {
    'content-type': file ? types[extname(file).toLowerCase()] || 'application/octet-stream' : 'text/plain',
    'cache-control': 'no-store',
    'x-nib-site': encodeURIComponent(root),
  });
  res.end(req.method === 'HEAD' ? undefined : file ? readFileSync(file) : 'Not found');
});

async function listen(port) {
  server.once('error', async (e) => {
    if (e.code !== 'EADDRINUSE' || port > firstPort + 20) throw e;
    const other = await fetch(`http://127.0.0.1:${port}/`, { method: 'HEAD' }).catch(() => null);
    if (other?.headers.get('x-nib-site') === encodeURIComponent(root)) {
      console.log(`Preview already running: http://localhost:${port}/`);
      process.exit(0);
    }
    listen(port + 1);
  });
  server.listen(port, '127.0.0.1', () => console.log(`Preview: http://localhost:${port}/  (private pages: /_private/, templates: /_templates/)`));
}

listen(firstPort);
