// Local Lighthouse harness: serves dist/client with gzip-compressed text
// assets to approximate Cloudflare's compression (production serves brotli,
// which is smaller — gzip here is the conservative bound).
import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const ROOT = path.resolve('dist/client');
const PORT = Number(process.env.PORT ?? 4328);
const TEXT = /\.(html?|css|js|json|svg|xml|txt|webmanifest)$/;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let p = path.join(ROOT, decodeURIComponent(url.pathname));
    if (p.endsWith('/')) p = path.join(p, 'index.html');
    fs.readFile(p, (err, buf) => {
      if (err) {
        res.writeHead(404).end('not found');
        return;
      }
      res.setHeader('content-type', MIME[path.extname(p).toLowerCase()] ?? 'application/octet-stream');
      // Mirror production: Cloudflare Workers static assets send long-lived
      // immutable cache for hashed /_astro/* files, short cache for HTML.
      res.setHeader(
        'cache-control',
        p.includes(`${path.sep}_astro${path.sep}`)
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=300',
      );
      if (TEXT.test(p)) {
        res.setHeader('content-encoding', 'gzip');
        buf = zlib.gzipSync(buf);
      }
      res.writeHead(200).end(buf);
    });
  })
  .listen(PORT, () => console.log(`gzip static server on :${PORT}`));
