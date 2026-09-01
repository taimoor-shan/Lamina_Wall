# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LAMINA — a premium, editorial, image-led B2B showroom site for wall panels and architectural surfaces. Visitors browse materials and build a **request** (a spec list of article numbers + quantities), submitted as a lead and emailed to the sales team. **It is not a store**: no prices, no "cart"/"checkout"/"buy" language anywhere. This repo is developed across many separate sessions — see `AGENTS.md` (operating rules) and `LAMINA-PRD.md` (the source of truth for what's done and what's next) before writing code. `reference/lamina-design-direction.html` is the client-approved visual mockup; every visual acceptance criterion means "matches this file."

## Commands

```sh
npm run dev        # astro dev — local dev server
npm run build      # astro build — output: dist/client (static assets) + dist/server (worker)
npm run preview    # astro preview
npm run deploy     # build + wrangler deploy — ONLY when the client asks
npx tsc --noEmit   # type check (strict; the project's verification gate)
```

There is **no test suite** (no test runner in package.json). Verification is: `npm run build` green + `npx tsc --noEmit` clean + browser checks against a served build:

```sh
node scripts/serve-gzip.mjs   # serves dist/client on :4328 (PORT env), gzip-compressed
```

- Full-stack API verification (Turnstile, Resend, /api/request) runs under `wrangler dev` against a built `dist` — needs the secrets in `.dev.vars` (Cloudflare test keys: `1x…` always passes siteverify, `2x…` always fails).
- `scripts/` helpers: `serve-gzip.mjs` (above), `contact-sheet.mjs`, `generate-placeholders.mjs`, `swatch-color-stats.mjs`, `finalize-product-copy.mjs` (one-off M2/M3 content tooling).

## Architecture

**Stack (fixed, per PRD §2):** Astro (static by default) + TypeScript + plain CSS with design tokens + Astro Content Collections + **one** Svelte 5 island (request tray) + Cloudflare Workers. No CMS, no Tailwind, no test framework.

- **Build config** (`astro.config.mjs`): `@astrojs/cloudflare` adapter with `imageService: 'compile'` (build-time WebP/AVIF — the adapter's default `cloudflare-binding` transforms at runtime instead) and `inlineStylesheets: 'always'` (CSS is a few KiB; inlining removes render-blocking stylesheet requests).
- **Content** (`src/content.config.ts`): two collections, both JSON files with a `glob` loader. `products` (92 entries, keyed by article code like `wg-01`) and `collections` (6 entries). `product.collection` is a `reference('collections')` validated at build time. Naming convention (PRD §3.3): code, JSON filename, and image filename share the same lowercased id.
- **Design system** (`src/styles/tokens.css` + `global.css`): CSS custom properties (typography scale `--fs-*`, colors `--ink`/`--ash`/`--line`/`--ember`, radius, borders) + global classes (`.eyebrow`, `.display`). `/style-guide` (src/pages/style-guide.astro) documents the system. Fonts are loaded from Google Fonts at runtime (Instrument Serif / Inter / Space Mono) — no local font files.
- **Request flow** (the interactive core):
  1. `RequestTray.svelte` — the single Svelte island, mounted `client:load` only on pages that carry swatches (homepage + 6 collection pages). Owns tray state, quantity steppers, drawer, `localStorage('lamina.tray')`.
  2. `/request` (`src/pages/request.astro`) — a plain native `<form method="post" action="/api/request">` that works with JS off (an `items_text` textarea inside `<noscript>` takes over). With JS, an inline module hydrates the recap table from the tray and submits JSON via fetch.
  3. `/api/request` (`src/pages/api/request.ts`) — `prerender = false` on-demand worker route: Origin check → field validation (security boundary) → duplicate submission-id guard (in-memory, short TTL) → Turnstile siteverify → Resend email. Product names are resolved server-side from the content collection, never from client-sent text. Form path 303s to `/thank-you`, fetch path returns JSON.
- **Recap table pattern** (the /request catalogue table): at build time the page bakes a `code → {thumbnail, collection}` JSON map (`getImage` + `getCollection`, one 120w WebP per article) into a `<script is:inline type="application/json" id="recap-data" data-value={...}>` tag — Astro doesn't template script bodies, so the data rides in an attribute expression, read at runtime via `getAttribute` + `JSON.parse`. Rows are rendered by the inline JS into `<tbody id="recap-body">`; stale localStorage codes fall back to a blank tile. Headerless row layout: `[48px swatch] [code over collection] [×qty] [Remove]`, card grid ≤640px.

## Gotchas (cost real debugging time — read before editing)

- **Astro style scoping**: a page's `<style>` block only styles *static* template markup. Elements created at runtime by JS carry no `data-astro-cid-*` attribute and match **no** scoped selector. Every selector that targets JS-rendered DOM must be wrapped in `:global(...)` (a leading `:global` makes the whole selector unscoped). Verify by grepping the built HTML's compiled `<style>` for plain selectors.
- **`reference()` resolution**: `product.collection` resolves to `{ id, collection }`, **not** a slug string. To map to a collection title, cast `p.data.collection as { id: string }` and key a title map by `c.id` (entry filename = slug).
- **`import.meta.env` is statically replaced at build time** — runtime bindings (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`) must come from `import { env } from 'cloudflare:workers'` (typed in `src/env.d.ts`), or the compiled bundle bakes in `undefined`. The only frontend key is `PUBLIC_TURNSTILE_SITE_KEY` (from `.env`).
- **Secrets**: `.env` holds the public Turnstile site key (safe to distribute via build env); `.dev.vars` holds the verify secret + Resend key — both are gitignored, never commit them.
- **Images are build-time assets**: products reference `swatchImage` via the content schema's `image()` helper — always resolve through `getImage`/`<Image>`/`<Picture>` (never raw `/src/...` paths or runtime URLs).
- **Astro never templates `<style>` content** — `{expr}` inside a `<style>` tag ships as literal text (`<style>{css}</style>` in the head until caught). Inject a dynamic CSS string with `<style is:inline set:html={css} />` (documented Astro pattern, `guides/styling.mdx`).
- **`prune-unreferenced-images` build hook prunes images ONLY** — never JS/CSS: the Svelte shared runtime chunk is referenced only via JS `import` (never named in HTML), and a blanket `/_astro/` regex deleted it, 404-ing the island import → hydration silently dead + astro-retry churn (M5 incident, fixed). The hook has an image-extension guard — keep it that way.

## Working rules (condensed — full text in AGENTS.md)

- Work milestone-by-milestone in PRD order; update the §0 status table and §10 session log in the same session/commit as the work; never mark acceptance criteria done without real verification.
- Hard constraints: no ecommerce language or prices anywhere; homepage stays the approved stacked full-bleed collection-spread layout; stack is fixed as above; secrets never in frontend bundles or commits. Deploys happen only when the client asks.
- If a decision can't be verified (live Resend key, production domain), leave it unchecked and log it as blocked — don't fake it.
