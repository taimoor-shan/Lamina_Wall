# LAMINA — Wall Panel & Architectural Surfaces Showroom
## Product Requirements Document (Milestone-Based)

**Version:** 1.2
**Prepared for:** Development agent (Claude Code, multi-session)
**Prepared by:** Muhammad (product owner / client)
**Status:** Ready for build

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

---

## 0. Status at a Glance

**Read this section first, every session, before reading anything else.** It tells you exactly what's done and what's next without requiring you to re-derive it from the milestone details below.

| Milestone | Status | Notes |
|---|---|---|
| M0 — Project Setup & Foundations | ☐ Blocked — see note | All foundations + acceptance criteria done & verified locally & on a **standing live deploy** (https://lamina-wall.lamina-wall.workers.dev — §10 Session 4; replaces the temp-account preview). ✅ GitHub remote + Workers Builds connection need the client's GitHub/Cloudflare accounts — see §10 Session 1. |
| M1 — Design System / Component Library | ☐ In progress | All 8 components + tokens + `/style-guide` built & verified (build passes, page serves 200). Catalogue now covers **every swatch in the reference folders — 92 products** (§10 Session 5). Visual acceptance vs mockup at 1440/390 still needs a human browser pass — see §10 Sessions 3–4. |
| M2 — Content Migration | ☐ Not started | |
| M3 — Core Pages | ☐ Not started | |
| M4 — Request Tray & Form | ☐ Not started | |
| M5 — SEO, Accessibility, Performance | ☐ Not started | |
| M6 — Cross-Browser & Responsive QA | ☐ Not started | |
| M7 — Content Freeze & Client Review | ☐ Not started | |
| M8 — Launch | ☐ Not started | |
| M9 — Handover | ☐ Not started | |

Status values to use: `☐ Not started` / `☐ In progress` / `☑ Done` / `☐ Blocked — see note`.

**Instructions for updating this table:** when you finish a milestone's acceptance criteria, change its row to `☑ Done`. When you start one, change it to `☐ In progress`. If you're blocked (missing a client answer, an account, a credential), mark `☐ Blocked — see note` and write the blocker in the Notes column. Update this table in the same commit/session where the underlying work happened — do not let it drift out of sync with reality, since this table is the first (and sometimes only) thing the next session reads.

---

## 1. Project Summary

A premium, editorial, image-led B2B marketing site for a wall panel and architectural surfaces manufacturer. The site showcases a curated selection of products (wood grain, stone/marble, metal, textile finishes) pulled from a much larger factory catalogue. It is **not an ecommerce store** — there are no prices, no checkout, no accounts. Instead, visitors (architects, designers, contractors, procurement teams) browse materials and build a **request** — a lightweight spec list of article numbers and quantities — which is submitted as a lead via a contact form, delivered by email to the sales team.

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
- [ ] Structure the curated product/collection data (Wood Grain, Stone & Marble, Metal, Textile) as Content Collection files, following §3.3 naming.
- [ ] Image pipeline step 1 — extract from source catalogue/PDF or client-supplied original.
- [ ] Image pipeline step 2 — crop to established aspect ratio per role (swatch/application/hero).
- [ ] Image pipeline step 3 — retouch only if needed (no material misrepresentation).
- [ ] Image pipeline step 4 — rename to product code convention.
- [ ] Image pipeline step 5 — place in `src/assets/products/` or `src/assets/applications/`.
- [ ] Image pipeline step 6 — confirm `astro:assets` output (WebP/AVIF + srcset generated correctly in a build).
- [ ] Image pipeline step 7 — write real alt text for every image (not filler).
- **Acceptance:**
  - [ ] All content for the 4 launch collections exists as typed, validated files.
  - [ ] Build passes with zero schema errors.
  - [ ] Spot-check: every launch image passes the resolution/aspect-ratio rules in §3.3.

### M3 — Core Pages
- [ ] Homepage: hero section.
- [ ] Homepage: sticky index strip.
- [ ] Homepage: Wood Grain collection spread.
- [ ] Homepage: Stone & Marble collection spread.
- [ ] Homepage: Metal & Textile collection spread.
- [ ] Homepage: closing statement section.
- [ ] Homepage: footer.
- [ ] Collection pages (`/collections/[slug]`) generated from Content Collections — application photo(s) + swatch filmstrip.
- **Constraint — do not deviate without a separate conversation:** the homepage stays in the stacked, full-bleed editorial layout from the approved mockup (Wood → Stone → Metal/Textile → Statement). This was a deliberate, client-approved design decision. Restructuring into tabs/filters/a condensed "explorer" is a real option worth discussing on its own terms, but is out of scope here — do not introduce it unilaterally.
- **Acceptance:**
  - [ ] All 4 collections have working, populated pages.
  - [ ] Navigation, including the sticky index strip, works.
  - [ ] **Visual acceptance:** homepage and one collection page compared directly against the approved mockup at desktop and mobile widths — section order, section heights, image cropping, spacing match.
  - [ ] Lighthouse performance ≥ 90 on homepage (mobile).
  - [ ] No unoptimized/original-resolution catalogue images shipped to the browser.
  - [ ] Hero image is priority-loaded; below-fold images are lazy-loaded.
  - [ ] Every image has explicit dimensions (no layout shift).
  - [ ] The Svelte request-tray bundle does not load on pages where the tray isn't present.

### M4 — Request Tray & Form
- [ ] Implement the Svelte request-tray island: selection state, persistent drawer, quantity steppers.
- [ ] Implement the request form (company, contact, email, phone, project name/location, notes, item recap) per §4.
- [ ] Implement `/api/request` server route: payload validation.
- [ ] Implement `/api/request`: Turnstile verification.
- [ ] Implement `/api/request`: submission-ID duplicate check (§4.1).
- [ ] Implement `/api/request`: Resend email send.
- [ ] Implement `/thank-you` confirmation page.
- [ ] Implement the no-JS fallback `/request` page (native form, still hits the same server route).
- **Acceptance:**
  - [ ] End-to-end test: select 3 items across 2 collections, submit with all fields, receive exactly one email.
  - [ ] Tray clears and confirmation displays after successful submit.
  - [ ] Double-click / resubmit of the same request produces only one email.
  - [ ] Server rejects a submission with an invalid/missing Turnstile token.

### M5 — SEO, Accessibility, Performance
- [ ] Meta tags + Open Graph tags on all pages.
- [ ] `sitemap.xml` and `robots.txt`.
- [ ] Semantic HTML pass — correct heading hierarchy site-wide.
- [ ] Alt text present on every image sourced from content (should already be true from M2 — verify).
- [ ] ARIA labels on the tray/drawer and the form.
- [ ] Keyboard navigation: tray operable and dismissible via keyboard; focus trapped while open.
- [ ] Image weight audit: confirm no full-resolution catalogue scans are reaching mobile.
- **Acceptance:**
  - [ ] Lighthouse ≥ 90 across Performance/Accessibility/Best Practices/SEO, mobile and desktop, on homepage and one collection page.

### M6 — Cross-Browser & Responsive QA
- [ ] Test on latest Chrome.
- [ ] Test on latest Safari.
- [ ] Test on latest Firefox.
- [ ] Test on latest Edge.
- [ ] Test on iOS Safari (real device or emulated).
- [ ] Test on Android Chrome (real device or emulated).
- [ ] Verify mobile breakpoint (< 480px).
- [ ] Verify tablet breakpoint (481-900px).
- [ ] Verify desktop breakpoint (901px+).
- **Acceptance:**
  - [ ] No layout breakage or horizontal scroll at any breakpoint.
  - [ ] Tray/drawer usable at all breakpoints.
  - [ ] Short QA checklist/report written and saved to the repo (e.g. `/docs/qa-report.md`).

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

## 6. Out of Scope for v1 (explicitly)

- Full catalogue (300+ SKUs) — only the curated launch collections. Expanding coverage is a post-launch content task, not a rebuild, thanks to the Content Collections structure.
- CMS / non-technical editing UI (see §9 for the future path).
- Multi-language / i18n.
- Blog or "Projects" case-study system beyond what's in the approved mockup's nav (can be a fast-follow milestone if wanted).
- Analytics dashboard beyond basic Cloudflare Web Analytics (free, privacy-friendly — recommend enabling it in M8, but it's not a build task).
- Restructuring the homepage away from the approved stacked-collection layout (e.g. a tabbed/filtered "material explorer"). Not rejected as an idea — just not part of this build, and not something to introduce unilaterally mid-implementation (see M3 note).

---

## 7. Risks / Open Questions for the Client

1. **Domain:** which domain will this launch on? Needed before M8.
2. **Sales inbox:** which email address should request submissions be delivered to? Needs a Resend-verified sending domain (client's own domain, not a Gmail address, for deliverability).
3. **Full-resolution source images:** the mockup used cropped catalogue-scan images. Confirm whether higher-resolution originals exist for production, or whether the catalogue scans are the final quality ceiling.
4. **Brand name:** "LAMINA" was a placeholder used in the mockup — confirm final name/logo before M1 componentization, since it affects the nav/footer components.

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
