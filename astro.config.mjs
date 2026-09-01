// @ts-check
import { readdir, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  // Static-by-default (Astro 7: `output: 'static'` is the default and replaces
  // the former 'hybrid' mode). Image-heavy marketing pages pre-render as Worker
  // static assets; routes opt in to on-demand execution with
  // `export const prerender = false` or non-GET handlers (the request form).
  adapter: cloudflare({
    // PRD §3.3/M2 requires build-time WebP/AVIF + responsive srcset generation.
    // The adapter's default 'cloudflare-binding' service transforms at runtime instead;
    // 'compile' keeps generation at build time (verified locally in `astro build`).
    imageService: 'compile',
  }),
  // All CSS is tiny (a few KiB per page); inlining removes every
  // render-blocking stylesheet request — one HTML request to first paint.
  build: { inlineStylesheets: 'always' },
  // M4: the request tray is the single interactive island, mounted
  // client:load only on pages that carry swatches (homepage + collection
  // pages). The /request page stays plain HTML with a small inline script.
  integrations: [
    svelte(),
    // PRD §3.3 "no originals shipped": the content layer marks every
    // schema-referenced image (92 swatches + 12 application photos) as
    // "referenced", which keeps a full-resolution source-format copy in
    // dist/client/_astro alongside each optimized WebP — ~40MB of files
    // no HTML ever links (first noticed during the M5 image-weight audit).
    // Astro only keeps them in case something imports the source directly;
    // nothing here does, so prune anything the built HTML never references.
    {
      name: 'prune-unreferenced-images',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const client = fileURLToPath(dir);
          const htmlDir = client;
          /** @type {string[]} */
          const htmlFiles = [];
          const walk = async (/** @type {string} */ d) => {
            for (const entry of await readdir(d, { withFileTypes: true })) {
              const p = path.join(d, entry.name);
              if (entry.isDirectory()) await walk(p);
              else if (entry.name.endsWith('.html')) htmlFiles.push(p);
            }
          };
          await walk(htmlDir);
          const referenced = new Set(
            (await Promise.all(htmlFiles.map((f) => readFile(f, 'utf8'))))
              .join('')
              .matchAll(/\/_astro\/([^"'\s>)]+)/g)
              .map((m) => /** @type {RegExpMatchArray} */ (m)[1]),
          );
          const astroDir = path.join(client, '_astro');
          for (const entry of await readdir(astroDir, { withFileTypes: true })) {
            // Images only! JS/CSS chunks are referenced from JS imports (not
            // HTML) — the Svelte runtime shared chunk 404s if pruned, which
            // silently kills island hydration (M5 incident).
            if (
              entry.isFile() &&
              /\.(webp|avif|jpe?g|png)$/i.test(entry.name) &&
              !referenced.has(entry.name)
            ) {
              await unlink(path.join(astroDir, entry.name));
            }
          }
        },
      },
    },
  ],
});
