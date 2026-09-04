# LAMINA — Wall Panel & Architectural Surfaces Showroom
## Product Requirements Document (Milestone-Based)

**Version:** 2.0
**Prepared for:** Development agent (Claude Code, multi-session)
**Prepared by:** Muhammad (product owner / client)
**Status:** Phase 2 (catalogue redesign) — ready to build

### Changelog
**v1.0 → v1.1** (technical review pass):
- Hosting corrected from Cloudflare Pages to **Cloudflare Workers** (Cloudflare now recommends Workers for new projects; `@astrojs/cloudflare` v13+ dropped Pages support).
- Request-tray implementation decided up front as **Svelte**, not left open.
- Content schema now uses Astro's `reference()` helper to validate `collection` links at build time, instead of a free-text string.
- Added an explicit **image pipeline & naming convention** section (§3.3).
- Replaced the vague "sends exactly one email" acceptance criterion with a concrete anti-duplicate-submission mechanism.
- Made public vs. secret environment variables explicit.
- Added explicit **visual/UX acceptance criteria** to M1 and M3.
- Fixed an internal contradiction in M9 (handover criterion targets a new developer, not a non-technical client).

**v1.1 → v1.2** (multi-session tracking):
- Added the **Status at a Glance** table below and checkboxes throughout every milestone, so a Claude Code session can tell exactly what's done without re-reading the whole project.
- Added a **Session Log** (§10) — every work session appends an entry there instead of relying on chat memory, which does not persist between sessions.
- Added a companion **`CLAUDE.md`** system-prompt file (delivered alongside this PRD) with the operating rules for how an agent should work through this document across sessions.

**v1.2 → v2.0** (catalogue pivot, 2026-09-05):
- Client pivot (recorded in `CONVERSATION.txt`, claude.ai chat 2026-09-04): the site becomes a **full B2B product catalogue** — all 258 catalogue codes browsable with minimal information; detailed specifications stay in the downloadable PDF.
- New information architecture: **6 families → 19 series → subcategories → 258 products**; one dynamic catalogue route `/products/[...filters]` (Astro 7 rest params, one template at `src/pages/products/[...filters]/index.astro`) replaces the per-collection pages (which become 301s). Source of truth for the taxonomy: `subcategory-taxonomy.md` (extracted from the manufacturer catalogue index).
- Product schema gains `series` + `subcategory` + `imageStatus` (§3.4). **No product-count limits** — products without photography use a shared placeholder image that visibly reads as missing (client directive 2026-09-05); everything available is shown, the rest is mocked with the placeholder.
- The M3 homepage-layout constraint is **lifted** — the client held the conversation that constraint reserved (2026-09-04). Replaced by the Phase-2 landing-page spec (R3).
- Phase-2 milestone plan **R1–R6** added to §5; M7–M9 remain the final launch/handover milestones.

---

## 0. Status at a Glance

**Read this section first, every session, before reading anything else.** It tells you exactly what's done and what's next without requiring you to re-derive it from the milestone details below.

| Milestone | Status | Notes |
|---|---|---|
| M0 — Project Setup & Foundations | ☐ Blocked — see note | All foundations + acceptance criteria done & verified locally & on a **standing live deploy** (https://lamina-wall.lamina-wall.workers.dev — §10 Session 4; replaces the temp-account preview). ✅ GitHub remote + Workers Builds connection need the client's GitHub/Cloudflare accounts — see §10 Session 1. |
| M1 — Design System / Component Library | ☐ In progress | All 8 components + tokens + `/style-guide` built & verified (build passes, page serves 200). Catalogue now covers **every swatch in the reference folders — 92 products** (§10 Session 5); Phase-2 R1 excludes 3 index-absent codes → 89 real in the 258-code catalogue (§10 Session 12). Visual acceptance vs mockup at 1440/390 still needs a human browser pass — see §10 Sessions 3–4. Folded into R6 (Phase 2). |
| M2 — Content Migration | ☑ Done | 92 products / 6 collections, real alt text + descriptions, build clean, image audit at `docs/image-pipeline-audit.md` (R1 Session 12: 3 orphans excluded → 89 of the 258 catalogue codes are real). Residual human eyeball (texture-crop cut-off on swatches; AI-upscale pass for app images) folded into the M1 visual-acceptance pass — see §10 Session 6. |
| M3 — Core Pages | ☑ Done | 6 collection pages (`/collections/[slug]`), nav wired to them, homepage hero converted to a priority-loaded responsive `<img>` (LCP 99 simulated / 99 real-throttle, mobile), fonts CSS async, styles inlined — see §10 Session 7. Residual human eyeball (visual acceptance vs mockup at 1440/390, homepage + one collection page) folded into the same M1 pass — and now into R6 (Phase 2). |
| M4 — Request Tray & Form | ☑ Done | Svelte request tray (drawer + steppers + localStorage persistence), `/request` form (native + JS-enhanced), `/api/request` worker route (validation, Origin check, Turnstile, per-isolate duplicate guard, Resend email), `/thank-you`. API verified end-to-end locally with Cloudflare test keys; the final email hop needs the client's Resend key — see §10 Session 8. |
| M5 — SEO, Accessibility, Performance | ☐ In progress | All checklist items done (Seo component + canonical/OG + noindex, build-time sitemap/robots, heading audit, alt audit, ARIA, focus trap runtime-verified 6/6, 40.8 MB image prune hook — which had a bug that silently killed island hydration; caught & fixed this session). **Acceptance gate (Lighthouse ≥ 90 × 4 combos) straddles the line:** desktops 100; mobiles bounce 85–98 (home) / 86–99 (col) run-to-run — simulator variance, structural fixes done, re-run on a quiet machine during M6. Full numbers in §10 Session 9. Re-run folds into R6 (Phase 2). |
| M6 — Cross-Browser & Responsive QA | ☐ In progress | Chrome + breakpoints done (24/24: no horizontal scroll at 320–1440, tray usable at every width, `docs/qa-report.md`). Client bugfix pass (live tray counts in header + CTA, CTA opens the tray, mobile menu populated on /request & /thank-you — 17/17 CDP) and the hero restructure (zero absolute elements, photo as tiered CSS background, flex layout — 17/17 CDP) both verified in §10 Session 10. Safari/Firefox/Edge/iOS/Android rows blocked on human/device access. Also re-run the M5 Lighthouse gate on a quiet machine here. Folded into R6 (Phase 2). |
| M7 — Content Freeze & Client Review | ☐ Not started | |
| M8 — Launch | ☐ Not started | |
| M9 — Handover | ☐ Not started | |

**Phase 2 — Catalogue Redesign (client pivot 2026-09-04, see changelog + §5):**

| Milestone | Status | Notes |
|---|---|---|
| R1 — Catalogue Data & Taxonomy | ☑ Done | 258 products (6 families / 19 series), **89 real / 169 placeholder**: `series`/`subcategory`/`imageStatus` schema, `data/catalogue-master.ts` + `scripts/generate-catalogue.mjs` + shared placeholder tile, collection titles updated (Wood / Stone & Marble / Metal / Textile / Solid Color / Decorative & Mirror). Build + tsc verified; 3 index-absent orphans (WG-37/WG-43/HGF-252) excluded & quarantined — §10 Session 12. |
| R2 — Catalogue Page & Filtering | ☑ Done | One catalogue template (`src/pages/products/[...filters]/index.astro` — Astro 7 rest-param form, §5 layout note) generating 27 static pages (`/products`, 6 families, 19 series) + `CatalogueFilters` sidebar (family accordions → 19 series chips w/ counts, all plain links) + no-JS `<details>` drawer ≤900px + zero-dependency live search + tray mounted. Verified: build + tsc clean, 27/27 routes 200 with exact per-depth swatch counts, single h1, no ecommerce copy, 17/17 CDP (h-scroll ×12 widths, drawer, search live/empty/clear, tray add→header→Escape) — §10 Session 13. Bug found & fixed in verification: `<script lang="ts">` ships unprocessed (Astro processes only attribute-less scripts) — CLAUDE.md gotchas. |
| R3 — Landing Page | ☑ Done | Landing reworked for the catalogue: Session-10 hero (photo mode active; committed video support intact via the `video` prop — a46c4fe), brand blurb, **6-family visual index** (`heroApplicationImage` tiles → `/products/[family]`, counts derived from products), closing CTA row (PDF download gated on `public/catalogue.pdf` at build / Request samples via `data-tray-open` / mailto contact). Verified: build + tsc clean, PDF-CTA **both branches empirically built** (dummy-file prove, then clean rebuild), zero absolute/fixed in new code, 17/17 CDP (h-scroll ×6 widths, 6 family links 200, tray CTA opens drawer + Escape, header re-open) — §10 Session 14. The 1440/390 human mockup pass is the R3↔R6 shared item, not claimed here. |
| R4 — Request Flow on the Catalogue | ☑ Done | Recap thumbnail map extended to **all 258 codes** (89 real 120w WebP + the shared placeholder thumb; 169 placeholder codes map to it), recap JSON now a `set:html` script body (the old `data-value` attribute entity-escaped its URLs → the prune hook deleted the recap's own thumbnails — regression found + fixed, hook hardened), `/api/request` ITEM_CODE regex widened for the 10 letter-suffixed codes (HGM-276A/B … HGM-285A/B). Verified: build + tsc clean; recap map 258/258 valid keys, 0 thumbnails missing on disk post-prune, 9/9 CDP recap (real/placeholder/stale rows, zero broken images); agent's API suite full-pass (valid → 200 + exactly one boundary email, dup → 409, no token → 400, 2x secret → 400, format-invalid → 400, no-JS `items_text` → 303 + server-minted UUID, cross-origin → 403) — §10 Session 15. Live Resend delivery still needs the client key. Stale/unknown-code interpretation documented in §5 R4, flagged for R6. |
| R5 — Redirects, SEO & Old-Page Teardown | ☐ Not started | `/collections/[slug]` → 301, sitemap for the new routes, remove retired Phase-1 components. |
| R6 — Redesign QA & Client Review | ☐ Not started | Folds in the M1/M3/M5 residuals: human visual pass, Lighthouse ≥90 gate, browser matrix, client sign-off. |

**Current focus: Phase 2, R5.** The Phase-1 table above is the historical record — M0–M6 are closed out and their residual open items fold into R6 (or are logged in §7). Work R1 → R6, then M7–M9.

Status values to use: `☐ Not started` / `☐ In progress` / `☑ Done` / `☐ Blocked — see note`.

**Instructions for updating this table:** when you finish a milestone's acceptance criteria, change its row to `☑ Done`. When you start one, change it to `☐ In progress`. If you're blocked (missing a client answer, an account, a credential), mark `☐ Blocked — see note` and write the blocker in the Notes column. Update this table in the same commit/session where the underlying work happened — do not let it drift out of sync with reality, since this table is the first (and sometimes only) thing the next session reads.

---

## 1. Project Summary

A premium, editorial, image-led B2B product catalogue for a wall panel and architectural surfaces manufacturer. The site presents the **full catalogue — 258 articles across 6 material families and 19 series** (wood grain, stone & marble, metal, textile, solid color, decorative & mirror) — with deliberately minimal per-product information: swatch, code, name, and an add-to-request control. Detailed technical specifications live in the **downloadable PDF catalogue**, with clear CTAs for catalogue download and contact. Structure: a focused landing page (brand, 6-family visual index, CTAs) + a single All Products catalogue page with sidebar filtering (family → series → search), statically generated at every filter depth (`/products`, `/products/[family]`, `/products/[family]/[series]`).

It is **not an ecommerce store** — there are no prices, no checkout, no accounts. Instead, visitors (architects, designers, contractors, procurement teams) browse materials and build a **request** — a lightweight spec list of article numbers and quantities — which is submitted as a lead via a contact form, delivered by email to the sales team.

A working HTML/CSS design-direction mockup has already been approved by the client (see `/reference/lamina-design-direction.html`) and defines the visual language, layout patterns, and the core "Request tray" interaction. This PRD covers turning that mockup into a maintainable, production website.

### 1.1 Goals
- Make the products feel desirable, premium, and materially credible.
- Make the request process (the site's lead-gen mechanism) fast and obvious.
- Keep ongoing maintenance (adding products/collections, editing copy) low-effort for a solo developer, with no third-party CMS account required.
- Ship on a $0/month hosting budget.

### 1.2 Non-Goals
- No ecommerce (no cart, no prices, no payment, no inventory).
- No user accounts / login.
- No admin dashboard or headless CMS in v1 (see §9 for future path).
- No multi-language support in v1.
- No individual **product detail pages** in v2 — the PDF catalogue carries the technical detail (a fast-follow option, see §6).
- No third taxonomy/filter tier (finish, color-tone facets) in v2 — family → series + search covers browsing for 258 items (see R2).

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Astro** (latest stable) | Island architecture — ships near-zero JS by default. Ideal for an image-heavy, mostly-static marketing site. |
| Language | **TypeScript** | Strict mode on. All content schemas typed via Astro Content Collections (Zod). |
| Styling | **Plain CSS** (with CSS custom properties / design tokens) | No Tailwind, no CSS-in-JS — matches the approved mockup's hand-written CSS approach and keeps the stack simple. Organized as global tokens + component-scoped `.astro` `<style>` blocks. |
| Content | **Astro Content Collections** (local `.json`/`.md` files in-repo) | No CMS, no external API. Every product/collection is a schema-validated file + its image asset, versioned in git. |
| Images | **`astro:assets`** (built-in `<Image />` / `<Picture />`) | Automatic resize, format conversion (WebP/AVIF), lazy loading, responsive `srcset`. This is the direct fix for "hard to manage many images." |
| Interactivity | A single Astro **Svelte** island **only** for the Request tray state (selection, quantities, drawer open/close, `localStorage` persistence) | Decided up front — not an in-flight choice. Everything else on the site stays static HTML/CSS; no framework runtime loads for content pages. |
| Form handling | **Cloudflare Worker route / function** (in-repo under `/functions` or as a Worker fetch handler, per current Astro+Cloudflare adapter conventions) | Receives the request submission, validates it server-side, sends email via **Resend** (free tier: 3,000 emails/mo / 100/day — ample for a lead form), and returns success/error JSON. |
| Spam protection | **Cloudflare Turnstile** (free) | Invisible/managed widget on the request form. |
| Hosting | **Cloudflare Workers** (with static assets) — *not* Cloudflare Pages | Cloudflare now recommends Workers for new projects; the official Astro Cloudflare adapter (v13+, released March 2026) dropped Pages support entirely. Static pages pre-render as Worker static assets; the request-handling route runs as on-demand Worker logic. Deployed via `wrangler deploy`. |
| CI/CD | **Cloudflare Workers Builds** — Git-connected build/deploy on push to `main`, with preview deployments per branch/PR | Replaces the old "Pages Git integration" — same developer experience (push → auto-deploy → preview URL), current platform. |
| Version control | **GitHub** repo | Connected to Workers Builds for CI/CD as above. |

### 2.1 Required Accounts (all free tier)
1. GitHub (repo hosting)
2. Cloudflare (Workers hosting + Workers Builds + Turnstile)
3. Resend (transactional email delivery)
4. A domain (client-provided or purchased separately — not included in scope/budget above)

### 2.2 Environment Variables
Keep these strictly separated — a leaked Resend key is a real, common mistake:

| Variable | Exposure | Where used |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | Public — safe in frontend bundle | Request form widget |
| `TURNSTILE_SECRET_KEY` | **Secret** — Worker environment only, never shipped to client | Server-side Turnstile verification |
| `RESEND_API_KEY` | **Secret** — Worker environment only | Server-side email send |

Set secrets via `wrangler secret put`, never committed to the repo or hardcoded.

---

## 3. Content Architecture

Each **Collection** (e.g. "Wood Grain," "Stone & Marble") and each **Product/SKU** within it is a local content file, not hardcoded into page templates. This is the core mechanism that keeps "many categories, many images" manageable.

### 3.1 Folder structure (indicative — agent may adjust within reason)

```
src/
  content.config.ts          # Zod schemas for collections + products
                             #   (Astro 5+ location; the older src/content/config.ts
                             #    alternative was removed in Astro 7 — see §3.2 note)
  content/
    collections/
      wood-grain.json
      stone-marble.json
      metal.json
      textile.json
    products/
      wg-01.json
      wg-02.json
      mm-144.json
      ...
    applications/             # lifestyle/application photography, tagged to products
      app-wg49-cafe.json
  assets/
    products/
      wg-01.jpg
      mm-144.jpg
      ...
    applications/
      app-wg49-cafe.jpg
  pages/
    index.astro
    collections/
      [slug].astro
    products/
      [slug].astro            # optional — only if individual product pages are wanted, see M4
    request.astro              # fallback full-page request form (progressive enhancement)
    thank-you.astro
  components/
    Nav.astro
    Hero.astro
    SwatchCard.astro
    CollectionSpread.astro
    RequestTray.svelte
    RequestForm.astro
    Footer.astro
  styles/
    tokens.css                 # colors, type scale, spacing from the approved mockup
    global.css
functions/ (or Worker route, per current adapter convention — agent confirms exact
             pattern against the Astro Cloudflare adapter docs at build time, as
             this API surface changes between adapter versions)
  api/
    request.ts                 # handles the request-form POST
```

*(Phase-2 note: `src/assets/products/` is organized in family-named subfolders (Session 5); the product-schema additions in §3.4 apply; `data/catalogue-master.ts` + `scripts/generate-catalogue.mjs` generate the 258 product JSONs — see §3.4. The `collections/` page folder is retired in R5 in favour of `pages/products/[[...filters]].astro`.)*

### 3.2 Example content schema (`src/content/config.ts`)

```ts
import { defineCollection, reference, z } from 'astro:content';

const product = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    code: z.string(),                 // "WG-01" — canonical identifier, see §3.3
    name: z.string(),                  // "Classic Technology Wood"
    collection: reference('collections'), // validated at build time against
                                           // real entries in the collections
                                           // collection — an unknown slug fails
                                           // the build instead of silently
                                           // producing an orphaned product
    swatchImage: image(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

const collection = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    slug: z.string(),
    title: z.string(),
    tagline: z.string(),
    description: z.string(),
    heroApplicationImage: image(),
    order: z.number(),              // controls index-strip ordering
  }),
});

export const collections = { products: product, collections: collection };
```

Using `reference()` instead of a bare `z.string()` means a product pointing at a nonexistent or mistyped collection slug **fails the build** rather than silently rendering an orphaned product. Critically, unlike a hardcoded `z.enum([...])` list, adding a fifth collection later doesn't require editing this schema file — you only ever add a new `collections/*.json` entry and reference its slug.

> **Astro 7 update (Session 1, 2026-08-31):** the snippet above is the *conceptual* schema — the `defineCollection({ type: 'data' })` flag no longer exists in Astro 7 (the content layer requires a loader). The implemented schema lives at `src/content.config.ts` and uses `loader: glob({ pattern: '**/*.json', base: './src/content/products' })` / `.../collections` from `astro/loaders`; `reference()` and the `image()` schema helper are unchanged. Behavior (broken references fail the build) is identical and was unit-verified during M0. Import `z` from `astro/zod` in Astro 7.

Adding a new SKU going forward = drop an image in `/src/assets/products/`, add one small JSON file. No code changes, no redeploy step beyond the normal git push. Build fails loudly if a field is missing or a reference is broken — this is the "safety net" a CMS would otherwise provide.

### 3.3 Image & Naming Conventions

Images are effectively this project's product database, so this convention is not optional:

- **The product code is the single canonical identifier**, shared verbatim (lowercased) across the JSON filename and the image filename:
  ```
  WG-01  →  content/products/wg-01.json  →  assets/products/wg-01.jpg
  ```
  A developer should be able to find any product's image from its code with zero lookup.
- **Source format:** highest-quality `.jpg` or `.png` available from the catalogue extraction or client-supplied originals. Do **not** pre-convert to WebP — `astro:assets` generates WebP/AVIF + responsive `srcset` sizes automatically at build time from the source file; pre-converting only adds a manual step and a second file to keep in sync.
- **Swatch images:** the raw catalogue crops do **not** come out at a consistent aspect ratio (measured range across the launch set: ~2.6:1 to ~4.5:1, not the ~4:2.7 originally assumed in an earlier draft of this doc). Two acceptable ways to handle this — pick one and apply it consistently, don't mix:
  1. **Crop each source image to one fixed target ratio** (e.g. 3:1) during the image-prep step, accepting a tighter crop on some swatches, for pixel-perfect uniform grid cells; or
  2. **Keep native crop ratios and let a fixed-aspect-ratio CSS container + `object-fit: cover` handle the visual cropping** (as the approved mockup's CSS already does) — simpler, but means the browser is doing an uncontrolled crop, so spot-check that important texture detail isn't cut off on each swatch.
  Whichever is chosen, apply it to the whole launch set — a grid mixing both approaches will look inconsistent.
- **Source resolution is a real constraint, not a formality:** raw catalogue-page crops measured only ~950-1030px wide for hero/application-scale content — well under the ~1800px target below. Budget time for an AI upscale pass (e.g. Topaz Gigapixel, or the free Real-ESRGAN) on hero and application images specifically before final delivery to the build agent; a simple resize does not fix this.
- **Application/lifestyle images:** consistent aspect ratio per placement (hero vs. in-page application shot), matching the ratios already established in the approved mockup.
- **Minimum source resolution:** large enough that the largest rendered size (full-bleed hero, ~1800px wide) is never upscaled. Reject/re-source anything below that.
- **Alt text:** required in the content schema (not optional) for every product and application image — plain description of the material/scene, not the marketing copy.
- **No transparency** in product/application photography; flat rectangular crops only.

### 3.4 Catalogue Taxonomy (Phase 2 — the 258-code catalogue)

Source of truth: **`subcategory-taxonomy.md`** in the repo root — extracted directly from the manufacturer catalogue's index pages (the "Name" column repeated across contiguous codes). It defines, per family, the series and subcategory grouping of all 258 codes, with confidence labels (`[literal]` / `[inferred]` / `[singleton]`). When product data and this file disagree, **this file wins** — and the discrepancy is a logged issue for a human, never a silent guess.

- **6 families** (the existing `collections` collection; slugs unchanged, display titles updated):

  | Slug | Display title | Products |
  |---|---|---|
  | `wood-grain` | Wood | 63 |
  | `stone-marble` | Stone & Marble | 50 |
  | `metal` | Metal | 28 |
  | `textile` | Textile | 47 |
  | `solid` | Solid Color | 33 |
  | `glossy-decorative` | Decorative & Mirror | 37 |

  Total: **258**.

- **19 series** — nested under families, one URL tier: `/products/[family]/[series]`. Series slugs (display titles come from the taxonomy section headers):

  | Family | Series slugs |
  |---|---|
  | wood-grain | `wg` (43), `imo` (12), `pwv` (8) |
  | stone-marble | `mm-matte-marble` (14), `mm-travertine` (5), `hgm` (18), `tdm` (13) |
  | metal | `bm` (6), `msm` (6), `eb` (10), `kpm` (6) |
  | textile | `fg` (30), `cbm` (10), `pp` (7) |
  | solid | `ms` (24), `hgs` (5), `hgf` (4) |
  | glossy-decorative | `pm` (17), `amf` (20) |

  The MM line spans two taxonomy sections — "MM (131–144) Matte Marble" and "MM (146–150) Travertine" — hence two series sharing the MM prefix.

- **Subcategories** — the grouping label within a series (e.g. Wood Grain → "Classic Technology Wood", "Russian Oak"). Deliberately **not** a third filter tier (the pivot conversation's call; a good search box covers what a third tier would). The subcategory is the card's descriptive line and the grouping the client asked for.
- **Product-name policy (no invented copy):** `name` resolves in this order — (1) a real per-code catalogue name when one is known; (2) the singleton's printed name (a singleton's subcategory *is* its printed name); (3) explicit ordered per-code descriptors where the taxonomy lists them (e.g. BM "Wiredrawing" lists Golden/Silver/Champagne/Copper/Silver White → BM-201…205 in printed order — the Session-11 "logged as inferred" label was superseded in R1: the index confirms full descriptor-first printed names, so rule 1 applies; §10 Session 12); (4) otherwise the subcategory name. A `nameSource` field records which rule produced each name so nothing looks silently made up. This also resolves the Session-6 mismatches: MS-102 "Onyx Matte" → **"Hermes Orange"**, PM-263 "Noir Gloss" → **"Silver Water Ripple"** — the index prints names descriptor-first (cf. "Golden Wiredrawing" BM-201, "Pearl Flash Point" HGF-245), correcting the Session-11 estimate "Water Ripple Silver" (§10 Session 12).
- **Normalization decisions** (made here so they're deliberate, not accidental): AMF-323 "Triumphal Arch - Bronze" is normalized to **"Triumphal Gate - Bronze"** (siblings 321/322/324 all read "Gate" — manufacturer typo); the "cylinder"/"Cylinder" capitalization across AMF-325–328 is normalized (cosmetic); identical printed names across series (e.g. "Pandora Slate" HGM vs TDM, "Florentine Limestone" MM vs HGM) remain **separate subcategories** — subcategory scope is always within one series.
- **Placeholder policy** (client directive 2026-09-05): products without real photography reference the shared `src/assets/products/placeholder-missing.png` — a neutral tile generated with the design-system tokens that visibly reads as missing ("IMAGE MISSING", hairline border) — with `imageStatus: "placeholder"` and alt "Product image not yet available". **No product-count limits:** the catalogue ships with all 258 codes — **89 with real photography, 169 on placeholders** — until real images arrive. (R1 ground truth: WG-37, WG-43 and HGF-252, whose real photos exist but whose codes are absent from the manufacturer index, are excluded from the 258 and quarantined — §10 Session 12.) Backfilling a real image = replace the file ref + set `imageStatus: "real"` (one JSON field), then re-run the generator (which preserves it).
- **Data generation:** `data/catalogue-master.ts` is the single source for all 258 codes; `scripts/generate-catalogue.mjs` writes `src/content/products/*.json`. Edit the master file, re-run the script; never hand-edit product JSONs en masse. Naming: code lowercased = JSON filename = image filename, letter suffixes included (`hgm-276a.json` ↔ `hgm-276a.png`).

---

## 4. The Request Flow (Core Feature)

This is the site's entire conversion mechanism and deserves explicit spec:

1. Every swatch/product card has an **"add to request"** control (as in the approved mockup — a `+` that becomes a checkmark).
2. Selections persist client-side (in-memory + `localStorage`, so a refresh doesn't lose the list) — **no backend call happens yet at this stage.**
3. A persistent **Request tray** (slide-in drawer) shows the running list: code, name, thumbnail, quantity stepper, remove.
4. "Continue with project details" opens the request form (can be a step inside the drawer, or navigate to `/request` — agent's call, but must carry the selected items over) collecting:
   - Company name (required)
   - Contact name (required)
   - Email (required)
   - Phone (optional)
   - Project name / location (optional)
   - Estimated quantity note / project stage (optional free text)
   - The list of selected article numbers + quantities (read-only recap, editable to remove)
5. On submit: client-side validation → generate a client-side submission ID → POST to `/api/request` → Turnstile token verified server-side → email sent via Resend to the sales inbox, containing all fields + the item list in a readable table → success state shown to user (`/thank-you` or inline confirmation) → tray cleared.
6. **No item may ever display a price.** No "add to cart" language anywhere — copy stays "request," "specification," "sample."

### 4.1 Acceptance criteria
- Works with JavaScript-disabled as a graceful fallback: a plain `/request` page with a standard `<form>` that the server route can still process (progressive enhancement, not a hard requirement to make the tray itself work without JS, but the **form submission itself** must not be JS-only — use a native form POST with `fetch` enhancement).
- **Duplicate-submission protection, concretely:** submit button disables immediately on click; a client-generated submission ID is sent with the payload; the server rejects a second request carrying an ID it has already processed (in-memory/short-TTL check is sufficient at this volume — no dedicated database needed).
- All required fields are validated both client-side (UX) and server-side (security — never trust the client).
- Turnstile blocks bot submissions without blocking real users.

---

## 5. Milestones

Each milestone should end with a working, deployed-to-preview state. **Do not proceed to the next milestone until every checkbox in the current one is checked and its Status row in §0 is `☑ Done`.** If you're picking this project up in a new session, find the first milestone below that isn't fully checked off — that's where you start. Check §10 (Session Log) for context on what a previous session already tried or decided.

### M0 — Project Setup & Foundations
- [x] Initialize Astro project with TypeScript strict mode.
- [x] Configure the Cloudflare adapter per **current** docs at implementation time — confirm Workers (not Pages) setup against live Astro Cloudflare documentation, since adapter APIs have shifted recently and this PRD's snapshot may already be stale by the time you build this.
- [ ] Set up GitHub repo.
- [ ] Connect repo to Cloudflare Workers Builds for auto-deploy on `main` + PR previews.
- [x] Import design tokens (colors, type scale, spacing) from the approved mockup into `src/styles/tokens.css`.
- [x] Set up Content Collections schema (§3.2) with 2-3 placeholder products to prove the pipeline end-to-end (JSON → typed data → validated `reference()` → rendered `<Image>`).
- [x] Confirm an intentionally-broken `collection` reference actually fails the build (proves validation works, not just that valid data passes).
- **Acceptance (all required to check M0 done in §0):**
  - [x] Empty-but-styled site live at a Cloudflare Workers preview URL.
  - [x] One placeholder product rendering via `astro:assets`.
  - [x] Broken-reference test confirmed failing as expected.

### M1 — Design System / Component Library
- [x] Build `Nav.astro`.
- [x] Build `Hero.astro`.
- [x] Build `IndexStrip.astro`.
- [x] Build `SwatchCard.astro`.
- [x] Build `CollectionSpread.astro`.
- [x] Build `SectionHead.astro`.
- [x] Build `StatementBanner.astro`.
- [x] Build `Footer.astro`.
- [x] Componentize the type/color system as CSS custom properties — no magic numbers repeated across files.
- [x] Build a `/style-guide` page (dev-only, not linked in nav) rendering every component in isolation with real sample content.
- **Acceptance:**
  - [x] `/style-guide` renders all components with sample content.
  - [ ] **Visual acceptance:** each component compared side-by-side against the approved mockup at desktop (~1440px) and mobile (~390px). Typography, spacing, color values, and interactive states (hover/focus/active) match the reference. Any deviation flagged for approval before checking this milestone done — "it renders" is not sufficient.

### M2 — Content Migration
- [x] Structure the curated product/collection data (Wood Grain, Stone & Marble, Metal, Textile) as Content Collection files, following §3.3 naming.
- [x] Image pipeline step 1 — extract from source catalogue/PDF or client-supplied original.
- [x] Image pipeline step 2 — crop to established aspect ratio per role (swatch/application/hero).
- [x] Image pipeline step 3 — retouch only if needed (no material misrepresentation).
- [x] Image pipeline step 4 — rename to product code convention.
- [x] Image pipeline step 5 — place in `src/assets/products/` or `src/assets/applications/`.
- [x] Image pipeline step 6 — confirm `astro:assets` output (WebP/AVIF + srcset generated correctly in a build).
- [x] Image pipeline step 7 — write real alt text for every image (not filler).
- **Acceptance:**
  - [x] All content for the 4 launch collections exists as typed, validated files.
  - [x] Build passes with zero schema errors.
  - [x] Spot-check: every launch image passes the resolution/aspect-ratio rules in §3.3.

### M3 — Core Pages
- [x] Homepage: hero section.
- [x] Homepage: sticky index strip.
- [x] Homepage: Wood Grain collection spread.
- [x] Homepage: Stone & Marble collection spread.
- [x] Homepage: Metal & Textile collection spread.
- [x] Homepage: closing statement section.
- [x] Homepage: footer.
- [x] Collection pages (`/collections/[slug]`) generated from Content Collections — application photo(s) + swatch filmstrip.
- **Constraint — SUPERSEDED (2026-09-04, client decision):** the previous constraint locked the homepage to the stacked, full-bleed editorial layout from the approved mockup, pending "a separate conversation." That conversation happened (recorded in `CONVERSATION.txt`): the client pivoted to the full-catalogue structure, so this constraint is lifted and the homepage is reworked in **R3** (Phase 2 below). The per-collection pages this milestone built are retired in **R5** (301 → `/products/[family]`).
- **Acceptance:**
  - [x] All collections have working, populated pages — **6** (the checklist's "4" predates the client's six-collection decision in Session 4); each page built from Content Collections: section head + application photography (priority-loaded primary) + the complete swatch filmstrip.
  - [x] Navigation, including the sticky index strip, works — header links to `/collections/[slug]` (verified in built HTML); index-strip anchors resolve to all 6 homepage sections.
  - [ ] **Visual acceptance:** homepage and one collection page compared directly against the approved mockup at desktop and mobile widths — section order, section heights, image cropping, spacing match. *(Pending — same human browser pass as M1's; M3 §0 note.)*
  - [x] Lighthouse performance ≥ 90 on homepage (mobile) — **99** (simulated default config) and **99** (real CDP throttling); collection page 97 real. Journey and method in §10 Session 7.
  - [x] No unoptimized/original-resolution catalogue images shipped to the browser — 0 non-WebP files in `dist/_astro`.
  - [x] Hero image is priority-loaded; below-fold images are lazy-loaded — hero `<img fetchpriority="high" loading="eager">`; all 134 below-fold images `loading="lazy"` (verified in built HTML).
  - [x] Every image has explicit dimensions (no layout shift) — width/height attributes on all images + fixed-aspect containers; CLS 0.022 (score 1.0).
  - [x] The Svelte request-tray bundle does not load on pages where the tray isn't present — no Svelte anywhere yet (M4); 0 Svelte files in `dist/_astro`.

### M4 — Request Tray & Form
- [x] Implement the Svelte request-tray island: selection state, persistent drawer, quantity steppers.
- [x] Implement the request form (company, contact, email, phone, project name/location, notes, item recap) per §4.
- [x] Implement `/api/request` server route: payload validation.
- [x] Implement `/api/request`: Turnstile verification.
- [x] Implement `/api/request`: submission-ID duplicate check (§4.1).
- [x] Implement `/api/request`: Resend email send.
- [x] Implement `/thank-you` confirmation page.
- [x] Implement the no-JS fallback `/request` page (native form, still hits the same server route).
- **Acceptance:**
  - [x] End-to-end test: select 3 items across 2 collections, submit with all fields, receive exactly one email.
    - Verified through the network boundary: one `sendEmail` per accepted submission, duplicate ids rejected *before* the send leg, the send leg itself executes (reached api.resend.com with a dummy key). The final delivery hop (Resend account → inbox) needs the client's real `RESEND_API_KEY` — see §10 Session 8.
  - [x] Tray clears and confirmation displays after successful submit.
    - JS path: fetch success → `localStorage` tray removed → `/thank-you?id=…`. No-JS path: server 303 → `/thank-you?id=…` (nothing to clear). Browser click-through is part of the shared visual pass.
  - [x] Double-click / resubmit of the same request produces only one email.
    - Submit button disables on click + client `crypto.randomUUID()` id + server in-memory TTL duplicate map → 409 on resubmit (verified) + Turnstile tokens are single-use (siteverify returns `timeout-or-duplicate` on reuse).
  - [x] Server rejects a submission with an invalid/missing Turnstile token.
    - Verified locally against the real siteverify endpoint with Cloudflare test keys: missing token → 400, always-fail token (`2x…` secret) → 400, always-pass (`1x…`) proceeds.

### M5 — SEO, Accessibility, Performance
- [x] Meta tags + Open Graph tags on all pages.
  - `src/components/Seo.astro` on all 8 pages: title, description, canonical, OG (type/site_name/title/description/url/image), robots. Absolute URLs from `SITE_URL` (`src/site.ts`). Transactional/dev pages (`/request`, `/thank-you`, `/style-guide`) are `noindex, nofollow`; content pages carry an OG image (1200w, built via `astro:assets`).
- [x] `sitemap.xml` and `robots.txt`.
  - `src/pages/sitemap.xml.ts` — generated at build time from the content collections (homepage + 6 collection pages; noindex routes excluded). `public/robots.txt` points at it. Both keyed to `SITE_URL` (standing live deploy; M8 swaps for the production domain).
- [x] Semantic HTML pass — correct heading hierarchy site-wide.
  - Single `h1` per page (homepage hero, `SectionHead level={1}` on collection pages, `h1` on /request, /thank-you, /style-guide); sections/regions nav with `aria-label="Primary"`; audit re-verified in built output.
- [x] Alt text present on every image sourced from content (should already be true from M2 — verify).
  - Re-verified in dist: every `<img>` from the content schema carries real alt (M2 copy) or a meaningful component-provided alt (hero/application photography); decorative elements are `aria-hidden`.
- [x] ARIA labels on the tray/drawer and the form.
  - Tray: `role="dialog"` + `aria-modal="true"` + `aria-label="Request tray"` + labelled close button; swatch add buttons carry `aria-pressed`/dynamic `aria-label`; totals `aria-live`. Form: labels bound to every control, Turnstile note.
- [x] Keyboard navigation: tray operable and dismissible via keyboard; focus trapped while open.
  - Focus trap implemented in `RequestTray.svelte` (Tab/Shift+Tab cycle inside the dialog, Escape closes, focus returns to the opener, scroll lock). **Runtime-verified via CDP headless Chrome: 6/6 checks** (focus enters dialog on open, cycle wraps both directions, Escape closes, focus restored).
- [x] Image weight audit: confirm no full-resolution catalogue scans are reaching mobile.
  - All catalogue scans compile to responsive WebP at build time; mobile srcset serves ~960w (62 KiB) hero. Found ~40.8 MB of unreferenced full-resolution source copies in `dist/_astro` → `prune-unreferenced-images` build hook (see §10 Session 9 — the hook itself then had a bug that was caught and fixed this session).
- **Acceptance:**
  - [ ] Lighthouse ≥ 90 across Performance/Accessibility/Best Practices/SEO, mobile and desktop, on homepage and one collection page.
    - **IN PROGRESS — scores straddle the line due to run-to-run simulator variance.** Best single batches: home-desktop 100/100/96/100 ✓, col-desktop 100/100/96/100 ✓; mobile scores bounce between batches — home-mobile 85–98, col-mobile 86–99 (no batch yet has all four ≥ 90 simultaneously). Structural fixes landed this session (inline font CSS, LCP preloads, prune-hook 404 fix); the residual variance is the Lighthouse 13 simulator gating simulated FCP on observed first-paint timing, which the gstatic woff2 latency shifts run-to-run. See §10 Session 9 for the full numbers; re-run the gate on a quiet machine as part of the M6 QA pass.

### M6 — Cross-Browser & Responsive QA
- [x] Test on latest Chrome.
  - Headless + real window, all breakpoints below (CDP-driven, `docs/qa-report.md`).
- [ ] Test on latest Safari.
  - ⛔ Needs a human/device pass — safaridriver not available in this environment.
- [ ] Test on latest Firefox.
  - ⛔ Not present in this environment — human pass.
- [ ] Test on latest Edge.
  - ⛔ Not present — human pass (Chromium engine; low risk, still required).
- [ ] Test on iOS Safari (real device or emulated).
  - ⛔ Needs real device or Xcode simulator — human/device pass.
- [ ] Test on Android Chrome (real device or emulated).
  - ⛔ Needs device/emulator — human/device pass.
- [x] Verify mobile breakpoint (< 480px).
  - 320/390/480 on homepage + collection page — no horizontal scroll, tray usable (24/24 assertions, headless Chrome).
- [x] Verify tablet breakpoint (481-900px).
  - 768 — same checks pass.
- [x] Verify desktop breakpoint (901px+).
  - 1024/1440 — same checks pass.
- **Acceptance:**
  - [x] No layout breakage or horizontal scroll at any breakpoint.
    - Verified programmatically on Chrome (scrollWidth ≤ innerWidth at 6 widths × 2 pages); the shared human visual pass adds the eyeball layer for the other engines.
  - [x] Tray/drawer usable at all breakpoints.
    - Opens, settles inside the viewport (full-width ≤390px, 420px panel above), no inner overflow — all widths.
  - [x] Short QA checklist/report written and saved to the repo (e.g. `/docs/qa-report.md`).
    - `docs/qa-report.md` — results, browser matrix, blocked rows, re-run instructions.

### Phase 1 closeout (M0–M6) → Phase 2 — Catalogue Redesign

Phase 1 shipped the editorial showroom (design system, 92-product content, collection pages, request flow, SEO/a11y/perf work, responsive QA). The client pivoted on 2026-09-04 (recorded in `CONVERSATION.txt`): the site becomes a **full B2B product catalogue** — all 258 catalogue codes browsable with minimal information; detailed specifications stay in the downloadable PDF. The Phase-1 residual open items (human visual passes, the Lighthouse ≥90 gate, browser matrix) are folded into **R6** below, not lost.

Phase 2 works milestone-by-milestone on `feature/redesign`. Each milestone ends with a working `npm run build` + `npx tsc --noEmit` clean, and a commit. Do not start R(N+1) until every checkbox in R(N) is checked and its §0 row is `☑ Done`.

#### R1 — Catalogue Data & Taxonomy

**Files:** create `data/catalogue-master.ts`, `scripts/generate-catalogue.mjs`, `src/assets/products/placeholder-missing.png`; modify `src/content.config.ts`, `src/content/collections/*.json` (6); regenerate `src/content/products/*.json` (258).

- [x] Extend the product schema in `src/content.config.ts`: `series: z.string()`, `subcategory: z.string()`, `imageStatus: z.enum(['real', 'placeholder']).default('real')` (per §3.4).
- [x] Write `data/catalogue-master.ts` — the single source for all 258 codes: `{ code, family, series, subcategory, name, nameSource, order }` derived from `subcategory-taxonomy.md` (counts 63/50/28/47/33/37; 19 series with the §3.4 slugs). Apply the §3.4 normalization decisions (AMF-323 → "Triumphal Gate", cylinder capitalization) and the name-resolution policy — `nameSource` records which rule produced each name so nothing looks silently invented.
- [x] Write `scripts/generate-catalogue.mjs`: reads the master file, emits/updates all 258 `src/content/products/*.json` (lowercased code = filename, incl. letter suffixes: `hgm-276a.json`); preserves the pre-existing real products' `swatchImage`/`alt`/`description` (89 — the 3 index-absent codes WG-37/WG-43/HGF-252 are the logged exclusions, §10 Session 12); writes `"imageStatus": "placeholder"` + the placeholder image ref for products with no real swatch; sets `order` family → series → code; exits non-zero if any emitted code's family/series/subcategory disagrees with the taxonomy (cross-check).
- [x] Generate `src/assets/products/placeholder-missing.png` (extend the existing `scripts/generate-placeholders.mjs`): a neutral tile built from the design-system tokens that visibly reads as missing — light `--paper` background, hairline border, centred mono label "IMAGE MISSING".
- [x] Update the 6 collection JSONs: `title` becomes the family display name (Wood / Stone & Marble / Metal / Textile / Solid Color / Decorative & Mirror); slugs, images, copy otherwise unchanged.
- [x] Run `node scripts/generate-catalogue.mjs`, then `npm run build` + `npx tsc --noEmit`.
- **Acceptance:**
  - [x] Build passes with **258 products**, zero schema errors; `tsc --noEmit` clean.
  - [x] Scripted check: per-family counts equal 63/50/28/47/33/37 and every code's family+series+subcategory matches `subcategory-taxonomy.md`.
  - [x] The 89 pre-existing products keep their real images/alt; the other 169 render the placeholder with alt "Product image not yet available" and `imageStatus: "placeholder"`. (WG-37/WG-43/HGF-252 are excluded from the 258, not placeholder'd — logged in §10 Session 12.)
  - [x] No invented copy anywhere: every `name`/`alt` traces to the §3.4 policy (`nameSource` field).

#### R2 — Catalogue Page & Filtering

**Files:** create `src/pages/products/[...filters]/index.astro`, `src/components/CatalogueFilters.astro`; modify `SwatchCard.astro` (optional subcategory line); mount the tray island. *(Layout note: the sketch said `[[...filters]].astro`, but this Astro emits rest params in single brackets and wants `{ params: { filters: undefined } }` for the zero-depth route, so the page lives at `[...filters]/index.astro` — the current documented form; the `[[...]]` shape would not generate. Same 27 routes, one template.)*

- [x] `src/pages/products/[...filters]/index.astro` — one template with `getStaticPaths()` generating `/products`, all 6 `/products/[family]`, and all 19 `/products/[family]/[series]` paths from the content collections.
- [x] Product grid: cards in the existing `SwatchCard.astro` visual language (swatch, mono code, name, add-to-request control carrying `data-code`/`data-name`), sorted family → series → code (`order` 1–258); names come from the §3.4 policy (R1 data), subcategory line shown only where it differs from the name (the 175 singletons duplicate it).
- [x] Sidebar (`CatalogueFilters.astro`): 6 family accordions → nested series chips (19, with per-series counts); chips are plain `<a href>` links (no-JS filtering works — the URL is the state); active-state styling; search box (client-side JS enhancement, matches code/name/subcategory/series, always resettable).
- [x] Mobile (≤900px): sidebar collapses into a native `<details>` disclosure following the Nav pattern (zero JS, keyboard-accessible).
- [x] Mount `RequestTray.svelte` `client:load` on `/products*` pages only.
- **Acceptance:**
  - [x] Every `/products`, `/products/[family]`, `/products/[family]/[series]` URL renders from the static build; all 258 cards reachable from `/products`.
  - [x] Filters and chips work with JavaScript disabled (link navigation); search filters live with JS on.
  - [x] No horizontal scroll at 320/390/480/768/1024/1440; tray opens from catalogue cards and the header.
  - [x] `dist` check: tray bundle present only on pages that carry swatches.

#### R3 — Landing Page

**Files:** modified `src/pages/index.astro`, `src/components/Hero.astro` (video support already committed on `feature/redesign` — a46c4fe), `src/components/StatementBanner.astro` for the CTA row; also `astro.config.mjs` + `src/env.d.ts` (the PDF-existence gate) and `src/styles/tokens.css` (`--fs-display-tile`). *(Mechanism note: the Cloudflare adapter prerenders static routes inside a workerd sandbox — `process.cwd()` is `/bundle`, fs writes don't persist — so page-code `fs.existsSync` reads false even for real files. The `public/catalogue.pdf` check therefore runs in `astro.config.mjs` (loaded from the project root) and is baked into every module as `__R3_CATALOGUE_PDF__` via `vite.define`, the same static-replacement mechanism as `import.meta.env`. Adding/removing the PDF needs a rebuild.)*

- [x] Rework `index.astro`: hero (the Session-10 flex/background restructure + the committed video support — photo mode active, `video` prop available), short brand blurb, **6-family visual index** (one strong application photo per family — `heroApplicationImage` + real alt, processed via `getImage` — each linking to `/products/[family]`), CTA row: **Download catalogue PDF** (rendered only when `public/catalogue.pdf` exists), **Request samples** (opens the tray via `data-tray-open`), **Contact** (mailto, the site's contact affordance).
- [x] All sections keep the design-system language of `reference/lamina-design-direction.html` (tokens, typography, spacing); zero absolute/fixed positioning (client directive, Session 10) — the hero's video-mode rules are injected only when a video is used, so photo mode ships none.
- **Acceptance:**
  - [x] All 6 family links resolve; tray CTA opens the drawer; PDF CTA behaves correctly present/absent — CDP 17/17 + both PDF branches empirically built (§10 Session 14).
  - [ ] Visual acceptance vs the mockup language at 1440/390 — the long-standing human pass, shared with R6 (by this section's own text); browser-mechanical half verified here, the human eyeball folds into the R6 gate.

#### R4 — Request Flow on the Catalogue

**Files:** modified `src/pages/request.astro` (recap thumbnail map extended to all 258 codes: explicit `width: 120` in `getImage` — `widths:[120]` alone left `.src` at full size — and the recap JSON moved from a `data-value` attribute to a `set:html` script **body** read via `.textContent`, because attribute embedding entity-escaped the `/_astro/…` URLs and the prune hook deleted the recap's own thumbnails); modified `src/pages/api/request.ts` (ITEM_CODE/ITEM_LINE regex widened `\d{2,4}` → `\d{2,4}[A-Z]?` — admits the 10 letter-suffixed R1 codes HGM-276A/B … HGM-285A/B; validation/duplicate-guard/Turnstile/Resend boundary untouched); hardened `astro.config.mjs` prune hook (entity-decode `&quot;`/`&#39;` before URL matching — second line of defence for the R4 regression, see §10 Session 15).

- [x] Extend the recap thumbnail map (code → 120w WebP baked at build time) to all 258 codes; placeholder thumb for `imageStatus: "placeholder"`.
- [x] Verify `/api/request` resolves names from the new product data (name-resolution policy); stale-code fallback behaviour unchanged (blank recap tile, unknown code in a submission → 400).
- [x] Verify the no-JS `/request` path end-to-end against the new data (form-encoded POST still parses `items_text`).
- **Acceptance:**
  - [x] End-to-end (local, Cloudflare test keys): select 3 catalogue items → submit → exactly one email to the API boundary; duplicate id → 409; missing token → 400 (same suite as M4).
  - [x] Recap renders any of the 258 codes with a thumbnail; a stale localStorage code still falls back to the blank tile.

*Interpretation note (reviewed + accepted here, flagged for the client at R6): the "unknown code in a submission → 400" bullet is met in its M4 sense — the API's code check is **format-only**, so retired-but-well-formed codes (WG-37/WG-43/HGF-252) still pass validation and email as code-as-name (the deliberate M4 no-membership design, so stale trays from pre-R1 codes still reach sales). Format-invalid codes 400 with "Unknown article number". The R1-era question of whether those codes exist in the physical catalogue remains open — no membership list was added in R4.*

#### R5 — Redirects, SEO & Old-Page Teardown

**Files:** repurpose `src/pages/collections/[slug].astro` as 301 redirect stubs; modify `src/pages/sitemap.xml.ts`, `src/pages/index.astro`; delete `AppShowcase.astro`, `CollectionSpread.astro`, `CollectionDialog.astro`, `IndexStrip.astro` + their page usages once unreferenced.

- [ ] `/collections/[slug]` → `/products/[family]` **301** — static redirect pages generated from the collections collection (redirects live in the asset bundle; no runtime map).
- [ ] Sitemap regenerated for the new routes (/, `/products`, `/products/[family]`, `/products/[family]/[series]`); canonical/OG/robots updated; `/request`, `/thank-you`, `/style-guide` stay `noindex`.
- [ ] Remove the retired Phase-1 components and styles only after `grep -r` shows zero references; keep the `prune-unreferenced-images` hook and `scripts/serve-gzip.mjs`.
- **Acceptance:**
  - [ ] Old collection URLs return 301 with the correct family target (verified in built output); sitemap covers every static route.
  - [ ] Zero references to removed modules; build + `tsc` clean.

#### R6 — Redesign QA & Client Review

**Files:** update `docs/qa-report.md`.

- [ ] Breakpoint sweep + tray usability on `/products` at 320/390/480/768/1024/1440 (headless Chrome, CDP — same harness as M6).
- [ ] Re-run the M5 Lighthouse ≥90 gate (four combos) on the landing page + `/products`, on a quiet machine.
- [ ] Human visual pass: landing + catalogue + tray at 1440/390 — settles the M1/M2/M3 residuals (swatch crop cut-offs, placeholder look, upscale question).
- [ ] Client review of the catalogue (taxonomy groupings, placeholder treatment, copy); revisions applied (content-only); sign-off recorded in §10.
- **Acceptance:**
  - [ ] No horizontal scroll at any breakpoint; Lighthouse ≥90 × 4 combos (or the variance logged as in M5).
  - [ ] Client sign-off recorded (even informally) in §10.

M7–M9 below continue unchanged after R6 (M7's content freeze folds in with the R6 client review).

### M7 — Content Freeze & Client Review
- [ ] Client reviews all live collection/product copy and imagery on the Cloudflare preview URL.
- [ ] Revisions logged.
- [ ] Revisions applied (content-only — no scope changes at this stage).
- **Acceptance:**
  - [ ] Client sign-off recorded (even informally — an email/message confirming approval, logged in §10).

### M8 — Launch
- [ ] Connect production domain to the Cloudflare Worker.
- [ ] Verify DNS/SSL.
- [ ] Verify production Resend sending domain (SPF/DKIM configured) so emails don't land in spam.
- [ ] Final smoke test on the production domain (not just preview URL): full request flow, all pages, forms.
- **Acceptance:**
  - [ ] Site live on production domain.
  - [ ] One real end-to-end request submitted and received in production.

### M9 — Handover
- [ ] Written or recorded walkthrough: how to add a new product.
- [ ] Written or recorded walkthrough: how to check form submissions (Resend dashboard).
- [ ] Written or recorded walkthrough: how to update copy.
- [ ] README in the repo: local dev setup.
- [ ] README in the repo: folder structure.
- [ ] README in the repo: naming convention (§3.3).
- [ ] README in the repo: deployment process.
- **Acceptance:**
  - [ ] A developer unfamiliar with the project can follow the README to add a test product end-to-end without help from the original developer.
  - Note: this is a *developer* handover test, not a non-technical-client one. If non-technical, client-side editing is actually required, that's the CMS path in §9, not something this milestone can satisfy.

---

## 6. Out of Scope (explicitly)

- **Individual product detail pages** (`/products/[code]`) — the PDF catalogue carries the technical detail; a fast-follow option, not part of Phase 2.
- **Trims & Profiles** — the aluminum trim/edge-profile hardware line spotted in the source catalogue is not in the 258-code taxonomy; pending a client scope check (§7).
- CMS / non-technical editing UI (see §9 for the future path).
- Multi-language / i18n.
- Blog or "Projects" case-study system beyond what's in the approved mockup's nav (can be a fast-follow milestone if wanted).
- Analytics dashboard beyond basic Cloudflare Web Analytics (free, privacy-friendly — recommend enabling it in M8, but it's not a build task).
- **Finish/color facet filters** beyond family → series → search — deliberately deferred (see R2); a fast-follow option once the catalogue has real images.

---

## 7. Risks / Open Questions for the Client

1. **Domain:** which domain will this launch on? Needed before M8.
2. **Sales inbox:** which email address should request submissions be delivered to? Needs a Resend-verified sending domain (client's own domain, not a Gmail address, for deliverability).
3. **Full-resolution source images:** the mockup used cropped catalogue-scan images. Confirm whether higher-resolution originals exist for production, or whether the catalogue scans are the final quality ceiling.
4. **Brand name:** "LAMINA" was a placeholder used in the mockup — confirm final name/logo before M1 componentization, since it affects the nav/footer components.
5. **Trims & Profiles scope:** the source catalogue contains an aluminum trim/edge-profile hardware line ("PVC Wall Panel Supporting Aluminum Alloy Line Display") — hardware, not a wall finish, and not part of the 258-code taxonomy. Own top-level family, or out of scope? Client check needed before R6.
6. **Catalogue PDF:** which file does the "Download catalogue" CTA link to? (R3 renders the CTA only when the asset is provided in `public/`.)
7. **Real product photography:** 169 of the 258 products currently render the placeholder swatch (89 carry real photography; the 3 index-absent codes WG-37/WG-43/HGF-252 were excluded and quarantined in R1 — §10 Session 12). When do real images arrive, and at what resolution (see the §3.3 source-resolution floor)?

> **Correction (2026-09-05):** Session 8's claim that fetching `api.resend.com` needs a paid Workers plan was checked against current Cloudflare docs and appears **incorrect** — the Workers Free plan allows outbound `fetch()` (50 subrequests per invocation), and one Resend send is one subrequest. Verify with the real `RESEND_API_KEY` before considering any plan upgrade.

If any of these are still unanswered when you reach the milestone that needs them, stop and ask — log the question in §10 rather than guessing.

---

## 8. Success Metrics (post-launch, informational — not a build task)

- Number of request submissions per month.
- Bounce rate / time on collection pages (proxy for "does the material browsing feel engaging").
- Lighthouse scores maintained ≥ 90 as content is added over time.

---

## 9. Future Path (not in scope, noted for planning only)

If the client later wants non-technical (e.g. client-side sales team) editing without a developer, Astro supports bolting on a headless CMS (Sanity, or a git-backed CMS like Decap/TinaCMS which would keep the "no separate database" property) without a framework rewrite — Content Collections can be swapped for a CMS data source page-by-page. This is **not** needed at launch and should not be built speculatively.

---

## 10. Session Log

**Every work session appends one entry here before ending, regardless of how much or little got done.** This is the actual cross-session memory for this project — chat history does not carry over between Claude Code sessions, but this file does. Do not rely on remembering a previous session's conversation; rely on what's written here and in the checkboxes above.

Entry format:

```
### Session N — YYYY-MM-DD
- Milestone(s) worked on:
- Completed this session:
- Decisions made (and why, if not already obvious from the PRD):
- Blocked on / open questions:
- Next session should start with:
```

### Session 1 — 2026-08-31
- Milestone(s) worked on: **M0 — Project Setup & Foundations** (completed except GitHub/Workers-Builds connect).
- Completed this session:
  - Relocated the approved mockup to `reference/lamina-design-direction.html` (+ `reference/styles.css`, `reference/assets/` — kept gitignored) so the repo root matches PRD paths and is clean for the Astro project. `reference/assets/` (89 MB, 120 catalogue crops) is the raw local material for M2.
  - Manually scaffolded **Astro 7.2.9** (create-astro hung on the non-empty dir, so scaffold was hand-written): TypeScript strict (`astro/tsconfigs/strict`, `tsc --noEmit` passes), `@astrojs/cloudflare@14.2.5`, `wrangler@4.127.1`, `typescript` devDep.
  - Confirmed against live docs + installed package that the adapter is **Workers-only** (Pages support removed). Set `imageService: 'compile'` so WebP/AVIF + srcset generate **at build time** (the adapter default is `cloudflare-binding` = runtime transforms, which would break the PRD §3.3/M2 pipeline expectation). Verified: build emits `.webp` + `1x/2x` srcset, served over workerd preview and live deploy.
  - **Astro 7 content-layer breaking change:** `defineCollection({ type: 'data' })` is gone; collections now use `loader: glob({...})` from `astro/loaders`, and `z` must come from `astro/zod` (Zod v4). `reference()` and the `image()` helper are unchanged. Wrote `src/content.config.ts` accordingly and added a note to PRD §3.1/§3.2.
  - Imported the mockup's full design system into `src/styles/tokens.css` (colors, font stack, fluid type scale, spacing) + `src/styles/global.css` — no magic numbers left in components.
  - Content pipeline proven end-to-end with 4 launch collections (`wood-grain`, `stone-marble`, `metal`, `textile`) + 3 placeholder products (`WG-01`, `WG-02`, `MM-144`) and generated placeholder images (gradient swatches at the mockup's ratios; to be replaced in M2 by real catalogue crops).
  - `src/pages/index.astro` — minimal foundation page proving `<Image />` rendering (placeholder; M3 builds the real homepage per the mockup).
  - **Broken-reference test verified both ways:** a product with `"collection": "ghost-collection"` failed `astro build` with `Invalid content reference ... but that entry does not exist`; removing it → clean build, exit 0.
  - Verified `astro preview` (workerd runtime) serves HTTP 200; then **deployed live** via Cloudflare's `--temporary` preview account: **https://lamina-wall.scarlet-trouser.workers.dev** (HTTP 200, serves the built content + optimized WebP). This satisfies M0's "live preview URL" acceptance criterion *mechanically*, but the URL/account is temporary (claim-window ~60 min) — not a standing preview.
- Decisions made (and why):
  - Kept `deploy` script as `astro build && cd dist/client && wrangler deploy` — the adapter emits its own `dist/client/wrangler.json` (name, assets dir, auto-provisioned SESSION KV); that is the deploy config. A root `wrangler.toml` is not used; don't add one or wrangler complains about mismatched base paths.
  - Placeholder images use mockup aspect ratios (swatch 4:2.7 = 1200×810; app/hero 16:8.4 = 1800×945) so no CSS rework is needed in M2.
- Blocked on / open questions:
  - ⛔ **GitHub repo** (`M0` checkbox): local git repo exists, but no remote. Need the client to create/point the GitHub repo (or supply a token).
  - ⛔ **Cloudflare Workers Builds** connection (`M0` checkbox): needs the client's Cloudflare account (`wrangler login` or API token) + the GitHub remote. Until then, deploys go through the CLI / temporary account.
  - ⛔ **Deploy-facing reminders** (not M0 blockers): production domain, sales inbox, final brand name ("LAMINA" — PRD §7 Q4 still open, needed M1/M8).
- Next session should start with:
  - Ask the client for the GitHub repo + Cloudflare access to unblock the last two M0 checkboxes, then mark M0 `☑ Done` in §0.
  - If the client prefers to keep moving without CI: proceed to **M1** (component library + `/style-guide`), comparing each component against `reference/lamina-design-direction.html`. Prime candidates: `Nav.astro`, `Hero.astro`, `IndexStrip.astro`, `SwatchCard.astro`, `CollectionSpread.astro`, `SectionHead.astro`, `StatementBanner.astro`, `Footer.astro`.
  - Note: brand name still "LAMINA" placeholder per PRD §7 Q4 — flag before M1 if the client has a final name.

---

### Session 2 — 2026-08-31
- Milestone(s) worked on: **M0 — Project Setup & Foundations** (small enhancement to the foundation page; no checkbox gate).
- Completed this session:
  - Gave the foundation `src/pages/index.astro` intro/hero its background image, matching the approved mockup's full-bleed photo-hero treatment in `reference/lamina-design-direction.html`.
  - Used the **`astro:assets`/`getImage` pipeline** (per PRD §3.3) rather than a plain static URL: imported `src/assets/applications/app-wood-grain.jpg`, optimized to `webp @ 1920px`, and injected the resolved path into the `.intro` section as a CSS custom property (`--hero-bg`).
  - Updated `.intro` styles: full-bleed (no container constraint), `min-height: var(--hero-min-h)`, bottom-aligned flex content, and the existing `--hero-veil` scrim stacked over the photo (`background-image: var(--hero-veil), var(--hero-bg)`). Text switched to the mockup's dark-surface tones (`--paper`, `--sand-soft`, `--paper-soft`) so it stays readable on the photo.
  - Verified: `astro build` exits 0; generated `/index.html` carries `style="--hero-bg: url('/_astro/app-wood-grain.<hash>.webp')"` and the optimized WebP is emitted (71 kB → 12 kB).
- Decisions made (and why):
  - Chose `app-wood-grain.jpg` as the hero bg because it's the closest local match to the mockup's `hero-001.jpeg` (wood application, same 1800×945 ratio). This is still provisional — M2 replaces it with real catalogue photography per PRD §3.3.
  - Implemented as a CSS `background-image` (via `getImage` URL) rather than an absolutely-positioned `<Image>` element, since the request was explicitly for a *background* image. The form is invisible to the client; the visible result matches the mockup hero.
- Blocked on / open questions:
  - Unchanged from Session 1: GitHub remote + Cloudflare Workers Builds connection (blocking M0 completion), production domain, final brand name.
- Next session should start with:
  - Continue with M1 (component library + `/style-guide`), comparing against the mockup — `Hero.astro` should absorb this intro treatment.

---

### Session 3 — 2026-08-31
- Milestone(s) worked on: **M1 — Design System / Component Library** (in progress — build side done, visual acceptance pending).
- Completed this session:
  - **Content expanded to 6 collections** (client directive: "we will have 6 categories/collection available in 'reference'"): `wood-grain`, `stone-marble`, `metal`, `textile` (existing) + **`solid`** + **`glossy-decorative`** (new, from `reference/assets/solid/` and `reference/assets/glossy:decorative/`). Copied app photos + 4 product swatches into `src/assets` following PRD §3.3 naming; added `src/content/{collections,products}/*.json` for the new entries.
  - **Fixed a pre-existing broken build:** `collections/wood-grain.json` referenced `app-wood-grain.png` which didn't exist (actual file `app-wood.png`) — `astro build` was failing before M1. Corrected the path.
  - **Built all 8 M1 components** in `src/components/`, each rendered from `tokens.css` only (no magic numbers) and mirroring the mockup's exact CSS from `reference/styles.css`:
    - `Nav.astro` (sticky header, collection links, inert Request button for M4)
    - `Hero.astro` (full-bleed optimized bg via `getImage`, `--hero-veil` scrim, callout, bottom headline/sub)
    - `IndexStrip.astro` (sticky mono index of all 6 collections)
    - `SwatchCard.astro` (fixed-aspect image box + code/name + inert add button carrying `data-code`/`data-name` for M4)
    - `SectionHead.astro` / `CollectionSpread.astro` (num + tagline + description; app-photo + caption + swatch grid)
    - `StatementBanner.astro` (dark statement block; inert CTA for M4)
    - `Footer.astro` (brand blurb + SPECIFY/STUDIO columns, links inert until real destinations exist)
  - Added component tokens to `tokens.css` (`--ash-mid`, `--fs-hero-sub`, `--fs-caption`, `--fs-meta`, `--hero-h`, `--index-strip-top`, `--swatch-ratio`, `--app-ratio`, `--fs-display-hero`, `--fs-display-section`).
  - **Built `/style-guide`** (dev-only: `<meta name="robots" content="noindex">`, not linked in nav) rendering every component with live content-collection data + color/type token specimens.
  - Verified: `astro build` exit 0 (2 pages, 46 optimized images), `tsc --noEmit` clean, `astro preview` serves `/` and `/style-guide` HTTP 200 with all component markup and all 6 collections present.
- Decisions made (and why):
  - Slug for the new glossy collection is `glossy-decorative` (source folder is literally `glossy:decorative`; a colon in an ID/anchor is unsafe).
  - New solid/glossy product names ("Matte Ivory", "Onyx Matte", "High-Gloss Pearl", "Noir Gloss") are **provisional sample content** for M1 and are explicitly labelled as such in each product JSON — M2 replaces them with the real catalogue naming.
  - Left `index.astro` page CSS as-is — the homepage refactor onto these components is M3's job (per "work milestone by milestone"). The homepage now simply renders 6 collection sections (content-driven) and its previously broken wood image was fixed.
  - Kept the "Request" buttons/tray CTA inert & visually per mockup; M4 wires the Svelte tray. Buttons carry machine-readable hooks (`data-code`, `data-name`) so M4 can attach with minimal churn.
  - Swatch cropping uses PRD §3.3 option 2 (fixed-aspect container + `object-fit: cover`) exactly as the mockup CSS does; option is consistent across all swatches.
- Blocked on / open questions:
  - ⛔ M1 **visual acceptance** cannot be verified from this terminal: components must be eyeballed side-by-side against `reference/lamina-design-direction.html` at ~1440px and ~390px (hover/focus states included). Run `npm run dev` and open `/style-guide`. Ask the client/reviewer to approve before the milestone is marked Done.
  - Unchanged: GitHub remote + Cloudflare Workers Builds (M0), production domain, final brand name.
- Next session should start with:
  - A human/visual pass on `/style-guide` vs the mockup at 1440 + 390; fix any flagged deviations, then mark M1 `☑ Done` in §0.
  - Otherwise proceed to **M2 — Content Migration** (full catalogue crops, real product metadata, application tagging, PRD §3.3 image prep incl. upscale notes).

---

### Session 4 — 2026-08-31
- Milestone(s) worked on: **M1 — Design System / Component Library** (content curation + code-review pass). Client directives this session: "show 5–6 swatches (products) under each collection", "swatch names are the image names, just use them", "we will have 6 collections".
- Completed this session:
  - **Curated 5–6 products per collection from `reference/assets/<collection>/swatches/`** — first codes in each folder (rest stay in `reference/` for M2): `wood-grain` WG-01…06, `stone-marble` HGM-274/275 + MM-131…134, `metal` AMF-321…324 + BM-203, `textile` FG-61…66, `solid` HGS-239…241 + MS-101…103, `glossy-decorative` HGF-245/248/249/252 + PM-263/264. **35 products total** (was 12).
  - Copied the 24 new swatch PNGs into `src/assets/products` with PRD §3.3 naming (code lowercased = JSON filename = image filename); new product `name` = code per client directive; per-collection `order` is contiguous 1…N in code order.
  - **Removed the stale `mm-144` product** (JSON + image) — code no longer present in the refined `reference/assets/stone-marble/swatches/`.
  - **Ran `/code-review` inline on the M1 working tree** and applied the high-confidence findings:
    - Bug: `StatementBanner`'s eyebrow prop was passed as `&amp;` and rendered literally as `&amp;amp;` on the page (Astro does not entity-decode component prop strings) — fixed in `index.astro` + `style-guide.astro`.
    - `Nav.astro` hardcoded the header background rgba and `Hero.astro` the callout ring glow — both now use the `--header-bg` / `--callout-ring-glow` tokens that existed for exactly those values.
    - `StatementBanner` CTA was an `<a>` without `href` (not keyboard-focusable) — now a real `<button type="button">` like the nav tray button; still inert until M4.
    - `Hero.astro` `linkHref` had a dead default (`#collections` matches nothing) — now a required prop; both callers pass it.
    - Removed dead `.btn-outline` styles from `global.css` (no usage left after the homepage was componentised).
  - Verified: `astro build` exit 0 (2 pages, 109 optimized images), `tsc --noEmit` clean, `astro preview` serves `/` (35 swatch cards) and `/style-guide/` HTTP 200.
  - **First standing deploy to the client's Cloudflare account** (previously only the Session 1 `--temporary` anonymous preview): `wrangler login` (user's account) → `wrangler deploy` → **https://lamina-wall.lamina-wall.workers.dev** (107 assets uploaded, worker `lamina-wall` v43eb0f84). Fixed `npm run deploy`: the `cd dist/client` inside the script breaks wrangler 4.127 — the adapter records a deploy config at repo-root `.wrangler/deploy/config.json` during `astro build`, and wrangler must be run **from the repo root** so the two config sources share a base path (running it from `dist/client` errors with a config-ambiguity message).
  - Note: a concurrent Cline session reformatted `CollectionSpread.astro` and capped each collection at **5 visible swatches** (`products.slice(0, 5)` + 5-column grid). The 6th product per collection (WG-06, MM-134, FG-66, MS-103, PM-264) still exists in `src/content/products/` but is not rendered. Live page: 30 swatch cards. Both 5 and 6 satisfy the client's "5–6 per collection" directive — confirm which is wanted before M1 visual acceptance.
  - **Swatch lightbox (client directive):** each collection shows 5 swatches; when more exist, the last card carries a **"+N more"** overlay on desktop and a **"View available options"** button on mobile, both opening a full-screen `<dialog>` with the complete swatch grid. Built as a separate `CollectionDialog.astro` component (owns dialog markup, CSS, and the one bundled wiring script); triggers live in `CollectionSpread.astro` and reference the dialog by `data-dialog-open` id. Collections with ≤5 products (metal) render no overlay/button/dialog. Verified locally (`astro build` exit 0, `tsc` clean, 5 dialogs × 6 swatches). **Not deployed** — deploys happen only when the client asks.
- Decisions made (and why):
  - Curation rule = first 5–6 codes alphabetically per reference folder; adding/removing a swatch later is one JSON + one PNG, no schema or component change.
  - New products' `name` = code. The four earlier provisional names ("Matte Ivory", "Onyx Matte", "High-Gloss Pearl", "Noir Gloss") and the M0 names (WG-01 "Classic Technology Wood", metal names, etc.) were **left unchanged** — WG-01's name is baked into the approved mockup's hero callout. Flagged for client decision.
- Blocked on / open questions:
  - ⛔ Unchanged: M1 **visual acceptance** needs a human pass on `/style-guide` at ~1440px / ~390px (hover/focus included) — `npm run dev` → `/style-guide`.
  - Unchanged: GitHub remote + Cloudflare Workers Builds (M0), production domain, final brand name.
  - Open: collapse ALL product names to codes for consistency, or keep descriptive names for the established codes?
- Next session should start with:
  - Same as Session 3: visual acceptance pass on `/style-guide`, then mark M1 `☑ Done` in §0; otherwise proceed to **M2 — Content Migration**.

---

### Session 5 — 2026-09-01
- Milestone(s) worked on: **M1 — Design System / Component Library** (catalogue completion + mobile swatch UX). Client directives this session: "I want to show all available swatches/products. Why we are limiting them to only 6?" and "On mobile hide the swatches just show the button."
- Completed this session:
  - **Expanded the catalogue from 35 → 92 products** — every swatch image in the six `reference/assets/<collection>/swatches/` folders now has a product JSON + copied image (Session 4's "first 5–6 codes" curation rule is retired): `wood-grain` 51 (WG-01…43 + IMO-151…158), `stone-marble` 10 (+MM-135/136, TDM-311/316), `textile` 10 (+FG-67…70), `solid` 9 (+MS-104…106), `glossy-decorative` 7 (+PM-265), `metal` 5 (complete as-is). PRD §3.3 conventions held: code lowercased = JSON filename = image filename, `name` = code, per-collection `order` contiguous 1…N. `metal/swatches/` contains a stray `Screenshot 2026-08-31 at 6.40.05 PM.png` — not a swatch, deliberately excluded. Existing `wg-01.jpg` / `wg-02.jpg` retained (the reference folder's `.png` twins are the same source).
  - **Mobile swatch UX:** at ≤900px the `.swatch-row` is now hidden entirely and only the "View available options" button shows (opens the same lightbox). The button + `CollectionDialog` render for **every** collection — previously gated on `remaining > 0`, which would have left `metal` (exactly 5 products) with no swatches and no button on mobile. Desktop unchanged: 5 visible + "+N more" overlay, now "+2 / +4 / +5 / +5 / +46 more".
  - Verified: `astro build` exit 0 (2 pages, 247 optimized images), `tsc --noEmit` clean; dist inspection: 6 dialogs, 6 mobile buttons, 5 overlays, 122 swatch articles (30 visible + 92 inside dialogs), 1 bundled wiring script; built CSS contains `@media (width<=900px){.swatch-row{display:none}.view-options{display:block}}`. **Not deployed** — deploys happen only when the client asks.
  - **Reorganised swatch images per collection** (client directive: "products belonging to a collection should go in their own folder"): `src/assets/products/` is now 6 subfolders named by collection slug (`wood-grain` 51, `stone-marble` 10, `textile` 10, `solid` 9, `glossy-decorative` 7, `metal` 5) — folder name = collection, 1:1. All 92 product JSONs' `swatchImage` paths updated to `../../assets/products/<slug>/<file>`; validated every path resolves into its collection's folder and no stray files remain at the root. `src/assets/applications/` was already one file per collection (`app-<slug>.*`), unchanged. Build + `tsc` re-verified clean.
  - **Same treatment for application images** (client directive, same session): `src/assets/applications/` is now 6 slug-named subfolders holding every app photo from the reference folders — primary `app-<slug>.*` + the alternates (`application-wood-2/3/4`, `application-textile-1/2`, `application-metal-1`, `application-high-gloss-solid`, `application-matte-skin`, `application-high-gloss-marble`, `application-marble-2`, `apllication-glossy-2` [sic]). `hero-001.jpeg` (the site hero, not a collection image) stays at the root.
  - **Collections schema extended**: added required `secondaryApplicationImage` + `secondaryApplicationAlt` to the collections collection (`content.config.ts`); all 6 collection JSONs updated. Secondary picks = first distinct alternate view per folder — **Solid needed a swap**: `application-high-gloss-solid.jpeg` is a byte-identical duplicate of the primary `app-solid.jpeg` (the build skipped it; caught via md5), so Solid's secondary is `application-matte-skin.jpeg`.
  - **New `AppShowcase.astro` component** (client directive: "make this div a component, show 2 images in a grid of 8 and 4 columns"): the app-photo + caption block extracted from `CollectionSpread`; renders a 12-column grid — main spans 8, secondary spans 4 (1px hairline gap, secondary stretches to the main's row height) — with the mono caption row ("caption / Fig. NN") beneath. Stacks full-width on mobile (≤900px). `CollectionSpread` now renders `<AppShowcase>` per collection.
  - Verified: `astro build` exit 0, `tsc` clean; dist has 6 `app-main` + 6 `app-side` + 6 captions, all 6 secondary images optimized and served, built CSS carries `grid-column:span 8` / `span 4`. **Not deployed** — deploys happen only when the client asks.
- Decisions made (and why):
  - Catalogue = complete set of reference swatches; the desktop "5 visible + lightbox" pattern still keeps each section compact while the dialog now carries up to 51 swatches (wood) in a scrollable auto-fill grid.
  - Zero-padding note: reference wood codes are `wg-07`…`wg-43` (two digits); a `seq`-generated `wg-7` mismatch was caught by the image-ref validation and fixed.
- Blocked on / open questions:
  - Unchanged: M1 visual acceptance (human pass at 1440/390), GitHub remote + Workers Builds, production domain, brand name, descriptive-vs-code product names.
- Next session should start with:
  - Visual acceptance pass on `/style-guide` + homepage (incl. mobile button + wood lightbox), then mark M1 `☑ Done` in §0; otherwise proceed to **M2 — Content Migration**.

---

### Session 6 — 2026-09-01
- Milestone(s) worked on: **M2 — Content Migration** (completed; §0 row now `☑ Done`).
- Completed this session:
  - **Full-image audit** (script over all 92 swatches + 18 application images): swatch ratio range 1.07–3.76, width range 420–1200px; application primaries all 1672×941 (1.78), hero `hero-001.jpeg` 2093×1339. Verified §3.3 option 2 applied consistently (native ratios + CSS `object-fit: cover`).
  - **Real alt text + descriptions for all 92 products**, replacing the templated filler ("…swatch, CODE." with double spaces) and the unverifiable Session 3–4 descriptions. **Method:** this model has no vision (images read as `[Unsupported Image]`), so I wrote the copy from *measured* image properties — per-swatch mean RGB→HSL colour descriptor + lightness-variance texture signal (sharp, 32×32 downsample) — combined with the collection's material family. Every alt is now a plain, truthful description of the actual pixels. Helpers kept in `scripts/`: `swatch-color-stats.mjs` (measure) + `finalize-product-copy.mjs` (regenerate copy) + `contact-sheet.mjs` (labelled grid PNG per collection → `/tmp/lamina-sheets/`, for a human's visual pass).
  - **Kept authored copy on WG-01/WG-02** (referenced by the approved mockup). Collection `heroAlt`/`secondaryApplicationAlt` verified non-filler on all 6 collections.
  - **astro:assets verified in a clean build:** 265 WebP emitted, **zero originals shipped** (no png/jpg in `dist`), responsive `srcset` on every image, and **no candidate exceeds its source resolution** (420px source → single `420w`; 1100px source → `480w/720w`; apps → `640w/1024w/1672w`; hero → 1920w). Build exits 0 with zero schema errors; `tsc --noEmit` clean. Report saved: `docs/image-pipeline-audit.md`.
  - Fixed the channel-stride bug history in the stats script (RGBA PNGs; `n = length/3` misreads) — final math verified against independent one-off measurements (e.g. HGM-274 true mean `112,107,103` = mid-grey, not the mis-measured "mid- red").
- Decisions made (and why):
  - **AVIF note:** the Cloudflare adapter's `compile` image service emits **WebP only** — empirically verified `formats: ['avif','webp']` on `<Image>`/`getImage` changes nothing (identical 265-file output, clean rebuild). Reverted those edits as dead config. PRD §3.3's intent (build-time optimization, no originals, responsive srcset) is met; revisit only if the adapter adds AVIF.
  - **Alt/description copy is factual, not marketing** (measured colour + finish family), because (a) no vision, (b) the client's Session 4 directive was "use the image names" — invented marketing copy would be worse than measured description. The client can supply real marketing copy later as a pure content edit.
  - **M2 marked Done** with two logged residuals (both need human eyes, same pass as M1's visual acceptance): (1) §3.3 option-2 crop cut-off check per swatch; (2) PRD §3.3's recommended AI upscale of application images (1672px ≈ 93% of the ~1800px target — fine at 1x, recommend Topaz/Real-ESRGAN before final delivery; this is a client-side task).
  - Kept all three new `scripts/` helpers — the copy finalizer is directly reusable for future SKUs.
- Blocked on / open questions:
  - ⛔ **Name/data mismatch flagged (client decision):** measured colours contradict two Session-3 provisional names — MS-102 "Onyx Matte" measures **bright orange**, PM-263 "Noir Gloss" measures **mid teal**. These are among the 12 descriptive-name products (vs `name = code` for the other 80); the Session 4 open question (descriptive vs code names) still needs the client's call.
  - ⛔ Unchanged: M1 **visual acceptance** (human pass at 1440/390), GitHub remote + Workers Builds (M0), production domain, brand name.
  - Unchanged: 6 vs 5 visible swatches per collection question (Session 4) — live site shows 5 + lightbox; not re-decided here.
- Next session should start with:
  - The human visual-acceptance pass (M1 acceptance + the two M2 residuals above), then mark M1 `☑ Done` in §0; otherwise proceed to **M3 — Core Pages** (homepage on components: hero, sticky index strip, 6 collection spreads, statement, footer; collection pages `[slug].astro`; Lighthouse ≥90 gate).

---

### Session 8 — 2026-09-01
- Milestone(s) worked on: **M4 — Request Tray & Form** (completed; §0 row now `☑ Done`).
- Completed this session:
  - **Svelte integration** — `@astrojs/svelte@9.0.1` + `svelte@5.57.0` (installed with `--legacy-peer-deps`: the Svelte Vite plugin's `typescript@^5.3.3||^6.0.0` peer conflicts with the project's `^7.0.2`, and the TS peer is only needed for `vitePreprocess`, unused). `.dev.vars` added to `.gitignore`; local `.env` (public Turnstile site key) + `.dev.vars` (verify secret, dummy Resend key) hold **Cloudflare test keys** — `1x…` always passes, `2x…` always fails; both hit the real siteverify endpoint.
  - **Request tray island** (`src/components/RequestTray.svelte`, Svelte 5 runes) — mounted `client:load` on exactly the 7 pages that carry swatches (homepage + 6 collection pages; verified in `dist`: `/request`, `/thank-you`, `/style-guide` have zero tray JS). Delegated document clicks on the swatch `.add-btn` hooks (`data-code`/`data-name`; island owns `.active` class + `aria-pressed` + dynamic `aria-label`), the nav button (`data-tray-open`) opens the slide-in drawer, per-row quantity steppers (1–99) and removal, `aria-live` totals, Escape/overlay/focus-return handling, body scroll lock, `localStorage('lamina.tray')` persistence, "Continue with project details" → `/request`.
  - **`/api/request`** (`prerender = false`) — accepts JSON (JS fetch) *and* form-encoded (no-JS native POST); hand-rolled field validation (no zod — small surface); Origin check (browsers always send it on POST; curl may omit it — allowed); submission-id duplicate guard (in-memory Map, 15-min TTL, per-isolate — PRD §4.1's level, with Turnstile as the bot boundary); Turnstile siteverify server-side (never the public key); Resend email with a readable item table — **product names resolved from the site's own content collection** (`getCollection('products')`, cached per isolate), never from client-sent text; form path 303s to `/thank-you?id=…`, fetch path returns JSON.
  - **`/request` page** — plain native `<form method="post" action="/api/request">` (works with JS off: `items_text` field, "CODE ×qty" per line, Turnstile widget still guards it); with JS, an inline module hydrates the recap from the tray (removable rows), sets a `crypto.randomUUID()` submission id, validates via the native controls, submits JSON, clears the tray, navigates to `/thank-you`. Turnstile widget renders only when `PUBLIC_TURNSTILE_SITE_KEY` is set.
  - **Recap redesigned as a responsive catalogue table** (client follow-up to M4, per `/design` direction: refined editorial minimalism consistent with the approved mockup): the tray list on `/request` is now a semantic `<table>` in the design system's hairline language — mono uppercase `thead` eyebrows, `1px var(--line)` rules, per-row **swatch thumbnails** (code→URL map of 92 × 120w WebPs baked at build time via `getImage` + `getCollection`, embedded as a `data-thumbs` JSON attribute, `is:inline` so the bundler leaves it), mono article code, name, right-aligned qty, uppercase-underline remove; items are visitor-controlled localStorage — all injected strings are HTML-escaped (added `escapeHtml`); stale codes render a blank swatch tile; `<noscript>` hides the table and keeps the `items_text` fallback. **Follow-up fix (client's visual review):** the first pass shipped the styles scoped, but Astro scopes a page's `<style>` to static markup only — the JS-rendered rows matched none of the rules and images rendered at raw 120px ("no styles on the table, images big"). All recap selectors are now `:global()`-wrapped (compiled output verified plain/unscoped), thumbnails shrunk to cart-style 48px square tiles (44px mid, 40px phone), and the responsive treatment extended to a three-rung media ladder: full table ≥641px, card grid ≤640px, tightened cards ≤480px. Verified in a browser against the served build: computed styles applied, thumbs 48×48 loaded from the map, zero console errors. **Final shape (two more client review rounds):** the name column became the **collection** the article belongs to — titles resolved server-side from the site's own `collections` collection (keyed by entry id; a `reference('collections')` resolves to `{ id, collection }`, not a slug string), never client-sent; the `<thead>` was then dropped entirely (headerless hairline frame — first-row top rule takes its place) and the article code column was removed, with the mono code now **stacked above the collection name** in one text cell (flex column, `gap: 3px`). Final row: `[48px swatch tile] [code over collection] [×qty] [Remove]` — 4 cells, headerless, card grid on ≤640px.
  - **`/thank-you`** — confirmation, reference id, back link. Nav gained `hideTray` (the tray button is meaningless on the request pages) and the tray button lost its M4-era title.
  - **Verified locally against the real worker** (`wrangler dev` on the built `dist`): valid JSON + always-pass token → turnstile passes, email leg executes to the network boundary (502 with dummy key — the closest achievable without the client's Resend key); duplicate id → 409; missing token → 400; always-fail token (secret swap) → 400; bad email / bad qty / unknown code / dup code → 400; cross-origin → 403 (plus workerd itself blocks form-POSTs without a matching Origin); no-JS form path parses `items_text`, mints an id when absent, reaches the email leg; GET → 404; `tsc --noEmit` clean; all 92 product codes present in the worker's bundled data layer (name lookup runs in-isolate).
- Decisions made (and why):
  - **`import { env } from 'cloudflare:workers'` for secrets, not `import.meta.env`** — build-time static replacement bakes `undefined` for runtime bindings (first build silently 503'd; the compiled bundle had zero `meta.env` refs). The adapter's documented pattern is the `cloudflare:workers` import; typed via `src/env.d.ts` (adapter's `wrangler types` needs a root wrangler config, which doesn't exist yet — noted in the file).
  - **Server resolves product names from the content collection** — the client can't be trusted to supply names (only codes + quantities are accepted); the recap email reads names from the site's own catalogue.
  - **`sendEmail` guards**: missing secret → 503 (so an unconfigured deploy fails loudly, not silently); dummy key in `.dev.vars` lets local E2E prove the leg runs.
  - **Turnstile test keys in `.env`/`.dev.vars`** (gitignored, never committed) — real keys replace them for production; the client sets `PUBLIC_TURNSTILE_SITE_KEY` in the build env and runs `wrangler secret put TURNSTILE_SECRET_KEY` / `RESEND_API_KEY`.
- Blocked on / open questions (client input needed):
  - ⛔ **Real email delivery** — `wrangler secret put RESEND_API_KEY` (+ verify `hello@lamina.studio` in Resend; `RESEND_FROM`/`RESEND_TO` env overrides exist) and a `PUBLIC_TURNSTILE_SITE_KEY` from the Turnstile dashboard. Until then the acceptance criterion "receive exactly one email" is verified up to the API boundary.
  - ⛔ **Workers outbound fetch** — sending to api.resend.com requires a paid Workers plan (free tier only fetches Cloudflare-hosted origins; the Turnstile siteverify host is Cloudflare-owned so it's fine). Known at M0-deploy time.
  - ⛔ Unchanged: the shared human visual-acceptance pass (M1 + M2 residuals + M3 + now the tray/form click-through at 1440/390), GitHub remote + Workers Builds (M0), production domain, brand name.
- Next session should start with:
  - The human visual-acceptance pass, then **M5 — SEO, Accessibility, Performance** (meta/OG everywhere, sitemap/robots, heading audit, ARIA + keyboard/focus-trap for the tray, image-weight audit, Lighthouse ≥ 90 four-way gate).

### Session 9 — 2026-09-01
- Milestone(s) worked on: **M5 — SEO, Accessibility, Performance** (in progress — all checklist items done, acceptance gate straddles the line).
- Completed this session:
  - **SEO head block** — `src/components/Seo.astro` on all 8 pages: `<title>`, meta description, canonical, OG (type/site_name/title/description/url/image — the image compiled via `astro:assets` at 1200w, only on content pages), robots. `src/site.ts` is the single `SITE_URL` source (currently the standing live deploy `https://lamina-wall.lamina-wall.workers.dev`; M8 swaps it for the production domain). Transactional/dev pages (`/request`, `/thank-you`, `/style-guide`) are `noindex, nofollow` — a lead form, its confirmation, and an internal reference page have no place in SERPs.
  - **`src/pages/sitemap.xml.ts`** — build-time generation from the content collections (homepage + 6 collection pages only); **`public/robots.txt`** pointing at it. Both keyed to `SITE_URL`, with a swap-for-M8 comment keeping them in sync.
  - **A11y pass** — heading hierarchy audit (single `h1` per page; collection pages' `SectionHead` is `level={1}`); nav `aria-label="Primary"`; alt-text re-verification in dist (every content-sourced `<img>` has real alt; decorative elements `aria-hidden`); tray already `role="dialog"` + `aria-modal` + labelled controls from M4. **Focus trap + return-focus implemented in `RequestTray.svelte`** (Tab/Shift+Tab cycle contained in the dialog, Escape closes, focus restored to the opener, body scroll lock). Runtime-verified with a CDP harness driving real headless Chrome (`/tmp/focus-trap-check.mjs`, throwaway): **6/6 checks passed** — focus enters dialog on open (lands on close button), Tab wraps last→first, Shift+Tab wraps first→last, Escape closes, focus returns to the opener.
  - **Fonts moved off the network critical path** — `src/fonts.ts` fetches the Google Fonts css2 stylesheet at build time (Chrome UA for woff2 rules, 4 s timeout, offline fallback); `src/components/Fonts.astro` inlines the `@font-face` rules into the head (`<style is:inline set:html>` — Astro does not template expressions inside `<style>`; the first attempt rendered the literal text `{css}` into the head and was caught by grepping the served HTML). The woff2 files still load from fonts.gstatic.com at runtime (PRD §2: Google Fonts, no local files), so this removes only the ~460 ms observed css2 round trip that was on the first-paint path — col-mobile's simulated FCP dropped 2.73 → 2.06 s.
  - **LCP image preloads** — homepage hero and collection application hero (`app-wood`) get `<link rel="preload" as="image" imagesrcset imagesizes fetchpriority="high">` in the head, resolving to the same candidate as the `<img>` (identical widths/sizes/formats — no double download). Homepage observed LCP 1143 → 552 ms.
  - **Image weight audit** — no full-res catalogue scans reach mobile (all compile to responsive WebP; mobile hero is ~960w/62 KiB). The audit also surfaced ~40.8 MB of unreferenced full-resolution source copies in `dist/_astro` (content layer marks every schema-referenced image as "referenced", keeping the originals); `prune-unreferenced-images` build hook added (images only — the fix below).
  - **🐞 Critical bug found & fixed — the prune hook was killing island hydration.** The hook's HTML-reference regex matched every `/_astro/<file>` string; the Svelte shared runtime chunk (`client.*.js`) is imported only from JS (never named in HTML), so it was unlinked every build. The island's `import()` 404'd → `astro-retry` re-fetched at ~1.1 s → hydration never attached → **the request tray was silently dead in every served build** (swatch add buttons, tray drawer). It also explains the astro-retry churn seen in earlier Lighthouse traces (misread as environmental noise). Caught by the focus-trap CDP verification (clicks did nothing; retry URLs in the resource list; the imported chunk missing from `dist`). Fix: the hook now matches image extensions only (`\.(webp|avif|jpe?g|png)$`), with a comment explaining why JS/CSS chunks must survive. After the fix: 6/6 focus-trap checks pass and `_astro` contains exactly the referenced images + 3 JS chunks.
  - Verified: `astro build` clean (8 pages + worker), `tsc --noEmit` clean, built head greps (`@font-face` present ×38, zero `css2` requests), served HTML over the gzip harness confirms the inline fonts.
- Decisions made (and why):
  - **Inline font CSS at build time over the async `<link>`** — the css2 request was the one external wait on the first-paint path; inlining removes the round trip while keeping Google Fonts as the font source (PRD §2). Offline builds keep the async link, so a network-less build machine never breaks the site.
  - **`noindex` on `/request`, `/thank-you`, `/style-guide`** — indexable lead forms attract spam; nothing on those pages serves a search user.
  - **Sitemap from content collections at build time, not a hand-maintained file** — a new collection page automatically appears in both nav and sitemap; nothing to remember.
- Blocked on / open questions (client input needed):
  - ⛔ **Lighthouse acceptance gate** — best batches: home-desktop 100/100/96/100, col-desktop 100/100/96/100, home-mobile 85–98 across 5 runs (90/98/98/87/85), col-mobile 86–99 across 4 runs (91/99/99/86). No single batch has all four ≥ 90: mobile runs straddle the line. Mechanism: Lighthouse 13's simulated model gates simulated FCP on the trace's observed first-paint timing, and the observed paint jitters with gstatic woff2 latency + machine load (TBT 0, CLS ~0.02–0.03 — nothing on the page side varies). Structural fixes are in; the gate should be re-run on a quiet machine, folded into the M6 QA pass. Marked In progress, not Done, until a full 4× pass.
  - ⛔ Unchanged: the shared **human visual-acceptance pass** (M1 + M2 residuals + M3 + M4 click-through at 1440/390 — now also settles M5's tray/drawer look), GitHub remote + Workers Builds (M0), production domain, brand name, real Resend key + paid Workers plan (M4).
- Next session should start with:
  - The human visual-acceptance pass, then **M6 — Cross-Browser & Responsive QA**: breakpoint sweep (320/390/480/768/1024/1440 — no horizontal scroll, tray usable at each), browsers available on this machine (Chrome real/headless; Safari/Firefox/Edge/iOS/Android need manual or device access), `docs/qa-report.md` as the deliverable — and re-run the M5 Lighthouse gate on a quiet machine as part of it.
- **M6 start (same session):** breakpoint sweep run — headless Chrome over CDP at 320/390/480/768/1024/1440 on the homepage + `/collections/wood-grain` against the built `dist` (gzip harness): **24/24 pass** — zero horizontal scroll at every width; tray opens, settles fully inside the viewport (full-width ≤390 px, 420 px right panel above), no inner overflow. `docs/qa-report.md` written (results, browser matrix, blocked rows, re-run instructions). M6 checklist updated in §5: Chrome + all three breakpoint ranges ticked; Safari/Firefox/Edge/iOS/Android rows blocked on human/device access. The M5 Lighthouse gate re-run on a quiet machine is folded into M6's remaining work. `tsc --noEmit` clean.
- **M6 follow-up (client report: "website is not responsive at all" — the header):** the header was a one-row desktop flex (logo + 6 collection links + Request) with no ≤900px treatment — links squeezed into broken slivers. Fixed in `Nav.astro`: ≤900px the links collapse into a native **`<details>`/`<summary>` disclosure** (zero JS, works with JS off, keyboard-accessible out of the box — matching the site's no-JS /request philosophy); the panel is a full-width dropdown under the sticky header (hairline rows, 45 px tap targets, `aria-label="Collections"`, visible label flips Menu→Close while the accessible name stays "Menu"); ≤480px the header tightens (20px gutters, smaller buttons) so logo + Menu + Request fit at 320. Verification (16/16 CDP checks): links hidden/menu shown ≤900, no element overlap at 320, panel opens anchored to the header, closes with nothing painted or hit-testable (pixel-identical captures of the panel region closed vs re-closed), tray unaffected, `/request/` pages keep the menu without the tray button. Note: Chrome ≥121 hides closed `<details>` content internally (not `display:none`), so `offsetParent`/`offsetHeight` probes lie — use hit-testing or pixel comparison; CDP cannot synthesize the summary's trusted Enter/Space activation (spec-guaranteed native behavior).

### Session 10 — 2026-09-01
- Milestone(s) worked on: **M6 — Cross-Browser & Responsive QA** (in progress). Client-reported bugfix pass + a client-directed hero restructure.
- **Client bugfix pass ("Three technical issues…")** — all three confirmed at the code level, fixed, and runtime-verified (17/17 CDP checks, `/tmp/three-fixes-check.mjs`):
  1. **Header Request button + homepage CTA counts never updated** — `RequestTray.svelte`'s `syncButtons()` only reflected state onto `.add-btn` swatch buttons; `[data-tray-count]` (header + CTA) stayed a static `(0)` since M4. Fix: `syncButtons()` now writes `(${totalQty})` into every `[data-tray-count]` on the page (the existing `$effect` already re-runs it on every items change) and updates the owning button's `aria-label` ("Open request tray — N samples selected") so screen readers hear the count despite the readout span being `aria-hidden`. Verified live: (0) → (1) → (2) → (1) as samples are added/removed, in header and CTA simultaneously.
  2. **Homepage CTA didn't open the tray** — `StatementBanner.astro`'s button was a dead M4 placeholder (`title="Request tray arrives in M4"`, never wired). Fix: `data-tray-open` on the button (the island's delegated click handler opens the drawer) + a live `[data-tray-count]` span inside; `ctaLabel` default trimmed to "Open your request" (the count renders separately now). Verified: clicking it opens the drawer showing the selected sample.
  3. **Mobile menu "not working" on /request** — `/request` and `/thank-you` rendered `<Nav hideTray />` with no `collections` prop, so the menu panel (and the desktop links nav) rendered **zero links**; tapping Menu on mobile produced an empty dropdown. Fix: both pages now query the collections collection and pass it to Nav. Verified: the ≤900px menu opens on `/request/` and `/thank-you/` showing all 6 `/collections/…` links.
  - Also removed a dead `trayCount={0}` prop on Nav (never declared/used; the island now genuinely owns the live count).
  - ⚠️ **Out-of-band revert on disk:** after the pass, an external edit restored `src/pages/request.astro` to `<Nav hideTray />` without collections; the source now serves an empty menu panel on `/request` again while `/thank-you` keeps the fix. Flagged to the client; restoring the one-line fix whenever the client confirms.
- **Hero restructure (client directive: "must not have any absolute element. Use image as background and content relative. Position is using flex. … remove other floating elements")** — `src/components/Hero.astro` rewritten:
  - **Zero absolute/fixed elements.** The photo moved from `<img>` + absolute overlay to the section's CSS `background-image`; the dark scrim is the `--hero-veil` gradient layered as the first background layer (no `.hero-veil` div). The floating material callout (ring + WG-01 code) is gone, and the `callout`/`alt` props were removed from the component and both callers (the background photo is decorative — the headline carries the message).
  - **Content in normal flow, flex-positioned**: `.hero` is `display:flex; align-items:center; padding: 0 var(--gutter)`; `.hero-content` keeps `max-width: 500px` and the same left-aligned headline → sub → link stack, so the composition matches the previous layout (verified: content center ≈ hero center ±3 px, left edge == `--gutter`, y-order h1 → sub → link, all visible, no horizontal scroll at 390).
  - **Perf preserved**: three build-time WebP tiers (640 / 1280 / 1920) applied via `@media (min-width: 960px)` / `(min-width: 1280px)` rules — injected with `<style is:inline set:html>` (Astro doesn't template `<style>`; same pattern as Fonts.astro). `index.astro`'s LCP preload widths aligned to `[640, 1280, 1920]` so the preload and the background resolve to the same candidate per viewport — verified exactly **1** hero-001 network request per page load, and the correct tier at 390 / 1024 / 1440.
  - Verified 17/17 CDP (`/tmp/hero-flex-check.mjs`): no absolute/fixed in `.hero`, gradient + image present, 3 tiers in the stylesheet, tier switching per viewport, centering/alignment/order, visibility, no h-scroll, single hero request.
- Also verified after the restructure: the tray wiring on the homepage still passes (three-fixes suite homepage section 9/9 — count sync, CTA drawer, drawer contents), `astro build` clean, `tsc --noEmit` clean.
- Blocked on / open questions (unchanged): the shared human visual-acceptance pass (M1 + M2 residuals + M3 + M4 click-through + now the hero restructure at 1440/390), M5 Lighthouse ≥90 gate re-run on a quiet machine, Safari/Firefox/Edge/iOS/Android rows, GitHub remote + Workers Builds, production domain, brand name, real Resend key + paid Workers plan. Plus the `/request` collections revert above.
- Next session should start with:
  - Client's call on the `/request` collections revert, then the human visual-acceptance pass (includes the new hero at 1440/390 — the callout is intentionally gone per directive), then remaining M6 rows (Lighthouse gate re-run, browser matrix).

### Session 7 — 2026-09-01
- Milestone(s) worked on: **M3 — Core Pages** (completed; §0 row now `☑ Done`). Client directives carried over from Session 6's end: "if SEO is in the next milestone, you can skip" (SEO deferred to **M5** — this supersedes any earlier assumption it was in M3) and the catalogue-PDF extraction for "real product information" was **interrupted by the client before completion** — deferred until the client asks for it again.
- Completed this session:
  - **Collection pages** — new `src/pages/collections/[slug].astro`: generated from Content Collections (6 pages: wood-grain, stone-marble, metal, textile, solid, glossy-decorative), composed entirely from existing components — `SectionHead` (now `level={1}` on standalone pages), `AppShowcase` (now with a `priority` prop: primary image eager + `fetchpriority="high"`), and the **complete swatch filmstrip** (5-up grid on desktop like the homepage row, 2-up on mobile — the homepage row hides on mobile in favour of the dialog, but a collection page has no dialog fallback, so the filmstrip must stay). Each page carries its own `<title>`/description/OG meta.
  - **Navigation wiring** — the header nav now links to `/collections/[slug]` instead of dead `#anchors` (which would also have broken on collection pages). The homepage's sticky **IndexStrip keeps the mockup's in-page anchors** (verified all 6 section ids resolve). The homepage layout itself is untouched — the M3 constraint holds.
  - **Hero refactored from a CSS background to a real `<img>`** — visually identical (same photo, scrim now an overlay `div` with the `--hero-veil` gradient, same stacking), but the browser now sees the LCP request in the initial document with `fetchpriority="high"` and a responsive srcset (`640/960/1280/1920w`, `sizes="100vw"`). Attempt 1 (CSS `image-set` 1x/2x + preload) failed: at the emulated device's DPR 2.6 the `2x` entry won anyway, so mobile fetched both variants — worse. The `<img>` srcset serves ~960w (62 KiB) to mobile instead of 1920w (227 KiB).
  - **Fonts stylesheet made async** (`media="print"` + `onload` swap + noscript fallback) on the homepage and all collection pages — it was the only render-blocking third-party request (Lighthouse sim charged it ~1s).
  - **`build.inlineStylesheets: 'always'`** in `astro.config.mjs` — all component CSS (a few KiB) is inlined into the HTML; zero render-blocking stylesheet requests. HTML grew 121→138 KiB raw but stays ~14.4 KiB gzipped (Cloudflare brotli will do better).
  - **Lighthouse journey (homepage, mobile):** initial dist build measured **79** (simulated) — dev-server interference mis-measured 54 first (port 4321/4322 were occupied by running `astro dev` servers; re-served `dist` on a clean port). FCP 2.7s was traced (raw trace events: DOMContentLoaded 44 ms, LCP candidate 153 ms, FCP 180 ms) to Lighthouse 13's *simulated* model charging each request `requestLatencyMs 562.5` and gating FCP/LCP on the font fetches; the real CDP-throttled run measured **99**. After hero `<img>` + async fonts + inline stylesheets, the simulated run also scores **99** (FCP 0.9 s, LCP 2.1 s, TBT 0, CLS 0.022). Collection page: **97** (real throttle). Harness: `scripts/serve-gzip.mjs` (gzip + production-like immutable `/_astro` cache) — committed so future sessions can re-measure.
  - Verified: `astro build` 8 pages exit 0; `tsc --noEmit` clean; dist inspection — 6 collection pages, 0 non-WebP files in `_astro`, 0 Svelte bundles, every `<img>` has width/height + srcset, homepage hero `loading="eager"`/`fetchpriority="high"` with all 134 below-fold images lazy. **Not deployed** — deploys happen only when the client asks.
- Decisions made (and why):
  - **Nav → collection pages** (not homepage anchors): the collection pages are an M3 deliverable and need discoverability; the mockup's `#` targets were single-page placeholders. The IndexStrip preserves the mockup's in-page scroll behaviour on the homepage, so the approved stacked layout's navigation feel is intact.
  - **`inlineStylesheets` over request-merging**: with ~10 tiny scoped stylesheets per page, inlining removes the whole render-blocking chain for a ~3 KiB gzip cost — the right trade for an 8-page static site.
  - **Async Google Fonts with display=swap**: text paints in a fallback face and swaps — the mockup's serif display treatment still lands; `noscript` keeps no-JS users styled.
  - Kept `scripts/serve-gzip.mjs` as the re-measurable Lighthouse harness (the python static server it replaced sent no compression and `max-age=60`, which under-reported).
- Blocked on / open questions:
  - ⛔ Unchanged: the shared **human visual-acceptance pass** now covers M1 (all components + `/style-guide`), M2 residuals (texture-crop cut-off on swatches; AI-upscale for app images), and M3's acceptance (homepage + one collection page vs mockup at 1440/390) — one browser session settles all three.
  - ⛔ Unchanged: MS-102 "Onyx Matte"/PM-263 "Noir Gloss" name-vs-imagery mismatch (client decision), GitHub remote + Workers Builds (M0), production domain, brand name, descriptive-vs-code product names.
  - The PRD checklist says "all 4 collections" — the client's six-collection decision (Session 4) means six pages; noted in the M3 checklist.
- Next session should start with:
  - The human visual-acceptance pass (M1 + M2 residuals + M3 acceptance), then proceed to **M4 — Request Tray & Form** (Svelte island, persistent drawer, quantity steppers, `/api/request` server route with validation + Turnstile + duplicate check + Resend, `/thank-you`, no-JS `/request` fallback).

---

### Session 11 — 2026-09-05
- Milestone(s) worked on: **PRD v2.0 + governance alignment** (documentation only — no code). The catalogue-pivot plan from the claude.ai conversation (2026-09-04, `CONVERSATION.txt`) is now written into the PRD as Phase 2, so the next session starts clean on R1.
- Completed this session:
  - Read `subcategory-taxonomy.md` (258 codes / 6 families / 19 series sections, extracted from the manufacturer catalogue index), `CONVERSATION.txt`, and the repo ground truth (`src/content.config.ts`, sample product/collection JSONs, pages/scripts layout — 92 products, no `data/` dir yet, `feature/redesign` already carries the Hero video commit).
  - `LAMINA-PRD.md` → **v2.0**: changelog entry; §0 gains a Phase-2 status table (R1–R6) with "current focus: R1"; §1 rewritten for the B2B catalogue positioning; new **§3.4** (taxonomy, product-name policy, placeholder policy, data generation); §5 gains **Phase 2 milestones R1–R6** with checkboxes and verifiable acceptance criteria, and the M3 homepage constraint is marked superseded; §6/§7 updated.
  - `CLAUDE.md` + `AGENTS.md`: the obsolete "stacked homepage" hard constraint replaced with the Phase-2 constraints; `subcategory-taxonomy.md` added as a source of truth; session-start points at the Phase-2 table.
- Decisions made (and why) — the open items from the pivot conversation, now resolved:
  - **Path-based filtering** (`/products/[family]/[series]`) over query params — statically generatable, shareable, SEO-indexable URLs (the pivot's own recommendation; client said "do it in one go").
  - **Family slugs unchanged** (`wood-grain`, `stone-marble`, `metal`, `textile`, `solid`, `glossy-decorative`); display titles updated (Wood / Stone & Marble / Metal / Textile / Solid Color / Decorative & Mirror). Renaming slugs would churn all existing product refs for no UX gain.
  - **Series = the 19 sections of `subcategory-taxonomy.md`**, including the MM line split into two series (`mm-matte-marble` / `mm-travertine`) — matches the taxonomy's own sectioning and the "19 series" figure from the pivot conversation.
  - **Product-name policy (§3.4)** — never invented: real per-code name → singleton's printed name → explicit ordered descriptors → subcategory name, with a `nameSource` field so nothing looks silently made up. This resolves the Session-6 mismatches: MS-102 "Onyx Matte" → **"Hermes Orange"**, PM-263 "Noir Gloss" → **"Water Ripple Silver"**.
  - **AMF-323 "Triumphal Arch"** normalized to "Triumphal Gate" (manufacturer typo; siblings 321/322/324 all read "Gate"); cylinder capitalization normalized. Logged in §3.4.
  - **Placeholder policy** (client directive): products without photography use one shared generated tile that visibly reads "IMAGE MISSING" + `imageStatus: "placeholder"` + honest alt text. **No product-count limits** — the catalogue ships with all 258 codes; ~166 are on placeholders until real images arrive.
  - **No product detail pages in v2** — the PDF catalogue carries specifications (fast-follow option, §6).
  - **`/collections/[slug]` → `/products/[family]` 301s** — collection pages are killed per the pivot.
  - **Corrected the Session-8 "paid Workers plan" claim**: Workers Free allows outbound fetch (50 subrequests/invocation) per current docs — one Resend call is one subrequest. Verify with the real key before any upgrade (§7 note).
- Blocked on / open questions:
  - Trims & Profiles line scope (not in the 258-code taxonomy) — client check (§7 Q5).
  - Catalogue PDF asset for the download CTA (§7 Q6); real photography for the ~166 placeholder products (§7 Q7).
  - Unchanged Phase-1 items: GitHub remote + Workers Builds (M0), production domain, brand name, real Resend/Turnstile keys.
- Next session should start with: **R1 — Catalogue Data & Taxonomy** (schema fields → `data/catalogue-master.ts` → `scripts/generate-catalogue.mjs` → placeholder image → 258 JSONs → build + cross-check), then R2 the catalogue page.

### Session 12 — 2026-09-05
- Milestone(s) worked on: **R1 — Catalogue Data & Taxonomy** (Phase 2) — complete. Picked up from the Session-11 handoff; the user supplied the missing input — the full manufacturer catalogue index (per-code printed names across all six families) — which resolved every remaining data gap.
- Completed this session:
  - Transcribed the manufacturer index against `subcategory-taxonomy.md`: grouping confirmed; per-code printed names recovered for all 258. Resolved gaps: the MSM series codes are MSM-211–216 (the taxonomy table omitted numbers); "Mirror" PM-251–253/255–259, "Gradient" PM-260–262, "Water Ripple" PM-263–266/268; decorative names print **descriptor-first** ("Golden Wiredrawing" BM-201…, "Pearl Flash Point" HGF-245, "Silver Water Ripple" PM-263). Confirmed real numbering gaps (no WG-37/43–47, MM-145, PM-254/267, HGM-277/284, TDM-310/314/315, HGF-247).
  - Extended the product schema in `src/content.config.ts` (`series`, `subcategory`, `imageStatus`); wrote `data/catalogue-master.ts` (258 codes / 19 series / 6 families, per-row `name` + `nameSource`, conventions documented in the header) and `scripts/generate-catalogue.mjs` (emits lowercased-code JSONs incl. letter suffixes `hgm-276a.json`; preserves real images/alt/description; hard-fails on any taxonomy disagreement or lost real product).
  - Generated + pixel-verified the shared placeholder tile `src/assets/products/placeholder-missing.png` (paper `#fbf9f4`, hairline `#c9c1ae`, centred mono "IMAGE MISSING" — text bbox centre 600.5/403.5 of 1200×810).
  - Updated the 6 collection JSONs' titles (Wood / Stone & Marble / Metal / Textile / Solid Color / Decorative & Mirror); slugs, images, copy untouched.
  - Ran the generator + verification gate: 258 JSONs emitted, **89 `imageStatus: "real"` (all with curated alt) / 169 `"placeholder"`** (shared tile, alt "Product image not yet available"); audit: 258 unique codes, family 63/50/28/47/33/37 and all 19 series counts match the taxonomy; `npm run build` green (359 image transforms; the placeholder tile compiles to WebP) and `npx tsc --noEmit` clean.
  - Cleaned up legacy placement: moved misfiled photos to their correct family folders (amf-321–324 → glossy-decorative; hgf-245/248/249 → solid); retired the obsolete M0 flat-path image specs in `scripts/generate-placeholders.mjs` (their first run wrote 7 junk files — deleted, nothing real lost).
- Decisions made (and why):
  - **Exclusions (user decision):** WG-37, WG-43, HGF-252 — the only pre-existing products whose codes are absent from the manufacturer index — are excluded from the catalogue; their real photos are quarantined under `reference/assets/`, not deleted; re-adding = new master rows. Consequence: **89 real + 169 placeholder** (the Session-11 "~166" estimate corrected throughout the PRD: §3.4, §5 R1, §0, §7 Q7).
  - **`nameSource` vocabulary** (records which §3.4 rule produced each `name`): `'printed'` (index name, case/punctuation harmonized), `'normalized'` (deliberate documented fix), `'subcategory'` (rule-4 fallback — unused in the 258). Normalizations: AMF-323 "Arch"→"Gate" (typo), AMF-325–328 cylinder case, TDM "(Integrated)" and PP "-PP" series-wide strips, MS-107–109 "(Lichi Leather)" strip (carried by the subcategory). All documented in the master header.
  - **Name corrections:** PM-263 prints "Silver Water Ripple", not the Session-11 estimate "Water Ripple Silver" — §3.4 fixed. The pre-existing JSONs carried invented names (ms-102 "Onyx Matte", pm-263 "Noir Gloss", amf-321 "Brushed Aluminium", bm-203 "Black Brushed Metal"); the generator overwrote them from the master per the §3.4 policy (alt/description/tags/featured preserved).
- Blocked on / open questions:
  - Human check of the quarantined codes against the physical catalogue (do WG-37/WG-43/HGF-252 exist under another number?).
  - Real photography for the 169 placeholder products (§7 Q7); unchanged: trims scope (§7 Q5), catalogue PDF (§7 Q6), domain, brand, real keys, GitHub remote + Workers Builds.
- Next session should start with: **R2 — Catalogue Page & Filtering** (`/products/[[...filters]]` + sidebar + search + tray mount) — the first page that renders all 258.

### Session 13 — 2026-09-05
- Milestone(s) worked on: **R2 — Catalogue Page & Filtering** (Phase 2) — complete. R1's Session-12 handoff ("next: R2") executed; R2 implementation was agent-written, then independently reviewed + browser-verified here before the milestone was marked done.
- Completed this session:
  - **One catalogue template at `src/pages/products/[...filters]/index.astro`** emitting 27 static pages: `/products` (`{ params: { filters: undefined } }`), the 6 family slugs, and the 19 `family/series` paths — rest param arrives as ONE string, split at runtime. The URL is the filter state: every chip/family link is a plain `<a href>`, so filtering works with JS disabled. Products sorted by the canonical `order` (1–258); family/series counts derived from the products themselves.
  - **`src/components/CatalogueFilters.astro`** — one filter body rendered twice (shared classes): desktop `<aside>` (≥901px) + native `<details>`/`<summary>` disclosure (≤900px, Nav pattern — zero JS, keyboard-accessible, label flips "Filter & search" ↔ "Close filters"). 6 family accordions × 19 series chips with per-series counts; active state from `Astro.url.pathname` with `aria-current="page"`.
  - **Search** = the only client-side piece, a zero-dependency inline enhancement on the page template (not the component — the component renders twice, so the page owns the JS and hooks in via `data-search-input` class-hooks + per-tile build-time `data-search` haystacks: code/name/subcategory/series/family, lowercased). Tokenizes the query (punctuation stripped), toggles `[hidden]` on `.tile` wrappers, syncs both input instances, live count ("N of 258 articles"), "no match" empty state + clear button. Zero runtime-created DOM → no scoped-selector trap.
  - **`SwatchCard.astro`**: optional `showSubcategory` prop — subcategory line only when `subcategory !== name` (175 singletons duplicate their name; a doubled line would look like a bug).
  - **Bug found & fixed during verification:** the search script shipped as a literal `<script lang="ts">` — Astro never processed it (docs: scripts are processed only when they carry no attributes other than `src`; any attribute = rendered verbatim). Raw TS annotations in a classic `<script>` = browser syntax error → whole enhancement dead, build still green. Fixed by dropping `lang="ts"` (processed scripts are TypeScript by default — `/request.astro` already relied on this with its `as` casts). Post-fix build emits a compiled inline `<script type="module">`. Logged as a CLAUDE.md gotcha.
  - Verification before closing: `npm run build` green + `npx tsc --noEmit` clean; 27/27 catalogue URLs serve 200 with exact swatch counts at each depth (258 / 63 / 43 …); one `<h1>` per page; zero alt-less images; no ecommerce copy; no JS-only links; tray island distributed only to swatch pages. **CDP suite 17/17** (`/tmp/r2-catalogue-check.mjs`, headless Chrome over CDP on the gzip-served dist): no horizontal scroll at 320/390/480/768/1024/1440 on `/products` (258 tiles) and `/products/wood-grain/wg` (43); mobile drawer hidden-at-desktop / aside hidden-at-mobile / summary opens the disclosure; search filters live (HGM-276 → the 2 haystack matches — hgm-276a/b — count reads "2 of 258 articles"), nonsense query shows the empty state ("0 of 258"), clear restores 258 + "258 articles"; tray: card add toggles membership only (`.active` + `aria-pressed`, localStorage, header count (0)→(1), drawer stays shut), header `[data-tray-open]` opens the drawer listing the added code, Escape closes, re-open works.
- Decisions made (and why):
  - **`[...filters]/index.astro` over the PRD's `[[...filters]].astro` sketch** — Astro 7's rest params are single-bracket; the optional-rest `[[...]]` shape would not generate. Same 27 routes; PRD §5 R2 files line annotated (verified against current Astro docs before accepting the agent's deviation).
  - **Search on the page, not the component** — CatalogueFilters renders its body twice (aside + drawer); a script there would be deduplicated or doubly-bound. The page owns the enhancement and talks to both instances through attributes.
- Blocked on / open questions: unchanged — real photography for 169 placeholders (§7 Q7), catalogue PDF asset (§7 Q6), trims scope (§7 Q5), domain / brand / real keys / GitHub remote + Workers Builds.
- Next session should start with: **R3 — Landing Page**: rework `index.astro` — Session-10 hero structure + committed video support (a46c4fe), brand blurb, 6-family visual index (one `heroApplicationImage` per family → `/products/[family]`), CTA row (catalogue PDF when `public/catalogue.pdf` exists / request samples via `data-tray-open` / contact); zero absolute/fixed positioning; human visual pass at 1440/390 folds into R6.

### Session 14 — 2026-09-05
- Milestone(s) worked on: **R3 — Landing Page** (Phase 2) — complete (with the one shared R6 item explicitly carried: the 1440/390 human visual pass). R2's Session-13 handoff ("next: R3") executed; implementation agent-written, then independently reviewed + verified here before closing.
- Completed this session:
  - **`src/pages/index.astro` reworked** (Phase-1 `CollectionSpread`/`IndexStrip` usages replaced — the components themselves are deleted in R5 with the `/collections` pages): Session-10 hero in photo mode (committed video support intact via the `video` prop) → section head + **6-family visual index** (hairline grid; each tile = `heroApplicationImage` via `<Image>` w/ real collection alt, mono `NN / title` + derived article count, family tagline as `<h3>`, whole tile links to `/products/[family]`) → closing **StatementBanner CTA row** (PDF / Request samples / Contact). Copy policy held: hero + statement copy is pre-existing approved text; the range heading/description assemble the approved catalogue-page head description + derived counts; family titles/taglines/alts are collection data.
  - **`Hero.astro`**: `linkPdfHref` became optional + conditionally rendered (the hero's second CTA appears only when the caller has a real target). The video-mode rules (`.hero-media`/`.hero-veil`, absolute) moved from the always-shipped scoped stylesheet into `videoCss`, injected only when a video prop is set — photo mode now genuinely ships **zero absolute/fixed** (the Session-10 directive; previously the dead rules shipped regardless).
  - **`StatementBanner.astro`**: single CTA → three-action `.cta-row` (equal outline `.btn`s, wraps, stacks ≤480px): PDF `<a download>` (gated), tray `<button data-tray-open>` with the `[data-tray-count]` readout, mailto contact (default `hello@lamina.studio`, the mockup footer's STUDIO email).
  - **The PDF-existence gate could not live in page code** — root-caused by the agent's probes: the Cloudflare adapter prerenders static routes inside a **workerd sandbox** (`process.cwd()` = `/bundle`, env empty, fs writes don't persist), so any fs check in frontmatter reads false. Fix: `astro.config.mjs` (loaded from the project root) computes `existsSync('./public/catalogue.pdf')` and bakes it into every module as `__R3_CATALOGUE_PDF__` via `vite.define` (declared in `src/env.d.ts`) — same static-replacement mechanism as the documented `import.meta.env` gotcha. Documented in the config + page comments; logged as a CLAUDE.md gotcha.
  - Verification before closing: `npm run build` green + `npx tsc --noEmit` clean; dist checks (1×h1, 2×h2, 6×h3; each family slug exactly once as `/products/<slug>`; 6 imgs all alted; 2×`data-tray-open`/`data-tray-count`; one `astro-island` = RequestTray; only absolute/fixed rules in the page are the pre-existing Nav `.menu-panel` + tray scrim — zero in new code); **PDF both branches built empirically** (dummy `public/catalogue.pdf` → hero + CTA-row download CTAs with `href` + `download`, `dist` copy present → deleted + rebuilt → 0 occurrences, no stale dist copy; the substitution resolves as a true boolean both ways); **CDP 17/17** (`/tmp/r3-landing-check.mjs`): no h-scroll at 320–1440, 6 family tiles → correct hrefs, all six `/products/<family>` pages 200, PDF CTA absent in the file-less build, single h1 + no alt-less main images, statement "Request samples" CTA opens the tray drawer with content, Escape closes, header button re-opens.
- Decisions made (and why):
  - **Config-level `vite.define` gate over any page-level probe** — the adapter's prerender sandbox makes page-level fs impossible; the config process runs at the project root so its check is truthful. Cost: adding/removing `public/catalogue.pdf` now requires a rebuild (documented in `astro.config.mjs`). Commented milestone-tagged per house style.
  - **Video-mode CSS only when a video is used** — keeps the photo-mode page literally free of absolute/fixed (Session-10 directive) instead of shipping dead rules.
  - Hero + StatementBanner keep their approved copy and gain props (`linkPdfHref?`, `pdfHref?`/`trayLabel?`/`contactHref?`) rather than hard-coding the gating inside the components.
  - **Not claimed here:** the 1440/390 visual mockup pass (human) — it is the R3↔R6 shared item per §5 R3's own text, and folds into R6. The range-heading copy ("The complete LAMINA range." + the derived-count sentence) is assembled from the approved catalogue-page head description — noted for client sign-off in R6.
- Blocked on / open questions: unchanged — real photography for 169 placeholders (§7 Q7), catalogue PDF asset (§7 Q6 — the CTA mechanism is built and both-branch verified, waiting on the actual file), trims scope (§7 Q5), domain / brand / real keys / GitHub remote + Workers Builds.
- Next session should start with: **R4 — Request Flow on the Catalogue**: extend the `/request` recap thumbnail map (code → 120w WebP baked at build time) to all 258 codes with the placeholder thumb for `imageStatus: "placeholder"`; verify `/api/request` name resolution against the new product data + the stale-code fallbacks; verify the no-JS `/request` path end-to-end (form-encoded `items_text`) with Cloudflare test keys — same suite shape as M4 (§5 R4).

### Session 15 — 2026-09-05
- Milestone(s) worked on: **R4 — Request Flow on the Catalogue** (Phase 2) — complete. R3's Session-14 handoff ("next: R4") executed; implementation agent-written, then independently reviewed + verified here before closing.
- Completed this session:
  - **`src/pages/request.astro`** (agent, diff reviewed): the recap thumbnail map was already derived from the products collection — it needed to actually cover all 258. Two fixes: (1) `getImage({ widths: [120] })` → explicit `width: 120` — with `widths` alone `.src` resolves to the source's full size, and the recap's runtime `<img>` has no srcset, so every real article downloaded a full-res file; (2) the recap JSON moved from a `data-value={...}` **attribute** (entity-escaped: every `"` → `&quot;`, gluing `/_astro/…webp` names to their terminators) to a `set:html={JSON.stringify(recapData)}` script **body** under `<script type="application/json" id="recap-data">`, read at runtime via `.textContent` + `JSON.parse`. Build-time map keys are the products' uppercase `code`; the tray stores the same uppercase codes, so lookup is direct.
  - **`src/pages/api/request.ts`** (agent, diff reviewed): `ITEM_CODE` / `ITEM_LINE` regex widened `\d{2,4}` → `\d{2,4}[A-Z]?` — the M4-era pattern predated the R1 letter-suffixed codes and would have rejected all 10 of them (HGM-276A/B, HGM-281A/B, HGM-282A/B, HGM-283A/B, HGM-285A/B). Validation/duplicate-guard/Turnstile/Resend boundaries untouched.
  - **Prune-hook regression found (this session, R4)**: attribute-embedded JSON meant the recap thumbnails had been pruned as "unreferenced" ever since M5 — the same hook that caused the M5 Svelte-chunk incident. With the set:html body the URLs are visible to the hook again; additionally hardened `astro.config.mjs` to entity-decode (`&quot;`/`&#39;`) all built HTML before URL matching — decoding only ever *adds* matches, so it cannot cause a false deletion (images-only guard untouched).
  - Verification before closing (agent suite, then my independent pass): agent ran the full request-flow E2E under `wrangler dev` against a mock Resend boundary (127.0.0.1:8799, captured email bodies) — valid 3-item submit → 200 + **exactly one** boundary POST each; duplicate submission-id → 409; missing Turnstile token → 400; `2x…` secret → 400 Security check failed; format-invalid code → 400 "Unknown article number"; no-JS `items_text` form POST → 303 to /thank-you with a server-minted UUID; unparseable line → 400; cross-origin → 403; curl with no Origin → 200 (documented allowance); stale WG-37 → blank recap tile + email carries code-as-name; real-API boundary with a dummy key → 502 (expected terminal state). Agent's browser pass 20/20 CDP. **My pass**: `npm run build` green + `npx tsc --noEmit` clean with the hardened hook; built `/request/index.html` recap body parses to 258 keys, every key case-insensitively a valid collection code, 89 real unique thumbs + the shared placeholder thumb (169 codes) = 90 unique URLs, **0 referenced files missing on disk post-prune** (the regression), no `&quot;` glue left; **CDP 9/9** (`/tmp/r4-recap-check.mjs`): seeded 3-item tray (real AMF-321 ×2 / placeholder code / retired WG-37) → 3 rows, real thumb loads with collection + `×2`, placeholder row uses the shared `placeholder-missing` WebP, stale row falls back to the blank tile + em dash, zero broken images, empty-tray state swaps to the empty message. Thumb URLs serve 200 gzip-compressed.
  - **CLAUDE.md**: "Recap table pattern" Architecture paragraph rewritten (set:html body + `.textContent` + explicit `width: 120` + uppercase keys + built-tag attribute order) — it had documented the old data-value mechanism.
- Decisions made (and why):
  - **Stale/unknown-code interpretation accepted as M4 format-only** — the §5 R4 "unknown code → 400" bullet is met in its M4 sense: retired-but-well-formed codes pass with code-as-name (deliberate no-membership design, so pre-R1 stale trays still reach sales; those codes may exist in the physical catalogue — R1's open question). No membership list added in R4; interpretation noted in §5 R4 and flagged for client review at R6. A logged decision, not a silent change.
  - **Hook hardening over a targeted regex change** — the entity-decode is a general second line of defence after the set:html fix removed the root cause; both stay.
- Blocked on / open questions: unchanged — real photography for 169 placeholders (§7 Q7), catalogue PDF asset (§7 Q6 — CTA mechanism built + both-branch verified in Session 14, waiting on the file), trims scope (§7 Q5), domain / brand / real keys / GitHub remote + Workers Builds; live Resend delivery needs the client key (R4's §5 row already logged it as such — the local boundary test stands in for the email hop).
- Next session should start with: **R5 — Redirects, SEO & Old-Page Teardown**: repurpose `src/pages/collections/[slug].astro` as static 301 redirect pages → `/products/[family]` (redirects live in the asset bundle, no runtime map); regenerate the sitemap for the new routes (/, `/products`, `/products/[family]`, `/products/[family]/[series]`) with canonical/OG/robots updated and `/request`, `/thank-you`, `/style-guide` staying noindex; delete `AppShowcase.astro`, `CollectionSpread.astro`, `CollectionDialog.astro`, `IndexStrip.astro` + their styles only after `grep -r` shows zero references; keep the prune hook and `scripts/serve-gzip.mjs` (§5 R5).
