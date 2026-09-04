// @ts-check
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { readdir, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';

// R5 redirect map: the six Phase-1 /collections/[slug] family pages (M3)
// are retired — their URLs now 301 to the catalogue's /products/[family]
// pages (PRD §5 R5). Astro config `redirects` is the mechanism:
// @astrojs/cloudflare emits every `redirect` route into
// dist/client/_redirects at astro:build:done (Netlify-style asset rules,
// trailing-slash variants included), and Workers Static Assets serves those
// rules at the asset layer — a real HTTP 301 shipped in the asset bundle;
// no HTML stub, no runtime map, no on-demand function. The map is generated
// from the collections collection JSONs (the same source the retired
// getStaticPaths read), so a future family needs only a new JSON file.
// This fs read happens in the config process — which loads at the project
// root — where page code cannot fs (prerender sandbox, see the
// __R3_CATALOGUE_PDF__ pattern below).
const collectionsDir = fileURLToPath(
  new URL('./src/content/collections', import.meta.url),
);
const collectionRedirects = Object.fromEntries(
  readdirSync(collectionsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const { slug } = JSON.parse(
        readFileSync(path.join(collectionsDir, f), 'utf8'),
      );
      return [`/collections/${slug}`, `/products/${slug}`];
    }),
);

// R3 landing CTA: the catalogue-PDF download action must render only when
// the PDF actually ships in public/. Astro pages cannot check the host
// filesystem themselves — the Cloudflare adapter prerenders static routes
// in a sandboxed context (process.cwd() is '/bundle', env is empty) with no
// view of the project tree, so any fs probe in page code always reads
// false. The check therefore runs here, in the config process (which Astro
// loads from the project root), and its result is baked into every module
// at build time as the __R3_CATALOGUE_PDF__ constant (same static-replace
// mechanism as import.meta.env). Changing the file requires a rebuild.
const hasCataloguePdf = existsSync(
  fileURLToPath(new URL('./public/catalogue.pdf', import.meta.url)),
);

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
  // redirects: false (R5) stops Astro from ALSO emitting meta-refresh HTML
  // stubs for the redirect routes above — the Cloudflare asset layer 301s
  // before any file match, and 200-servable stubs would only mask a
  // regression (a lost _redirects rule must 404 loudly). The adapter writes
  // the rules from the route manifest regardless of this flag.
  build: { inlineStylesheets: 'always', redirects: false },
  // R5: retired Phase-1 /collections/[slug] → /products/[family] (see the
  // collectionRedirects map at the top of this file).
  redirects: collectionRedirects,
  vite: {
    // R3: bake the config-process PDF check into every module (see
    // hasCataloguePdf above). 'true'/'false' are literal JS booleans after
    // substitution, so page code can use the constant in an if/ternary.
    define: {
      __R3_CATALOGUE_PDF__: hasCataloguePdf ? 'true' : 'false',
    },
  },
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
          // HTML-entity-decode before matching (R4): image URLs baked into
          // attribute values — e.g. JSON in a data-value attribute — ship
          // with &quot; for every quote, which glued file names to their
          // terminators and got the recap table's own thumbnails pruned as
          // "unreferenced" (404). Decoding only ever ADDS matches, so it
          // cannot cause a false deletion.
          const referenced = new Set(
            (await Promise.all(htmlFiles.map((f) => readFile(f, 'utf8'))))
              .join('')
              .replaceAll('&quot;', '"')
              .replaceAll('&#39;', "'")
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
