# QA Report — M6 Cross-Browser & Responsive

Status: **In progress** — automated portion done; browser matrix partially blocked on devices/humans (see below).

## What was verified (automated, headless Chrome)

Harness: headless Chrome driven over CDP (`/tmp/breakpoint-sweep.mjs`), serving the built `dist/client` through `node scripts/serve-gzip.mjs` (port 4328, gzip). Each page was checked at 6 widths × 2 pages = 12 page-loads, 24 assertions:

| Width | Class | Homepage | /collections/wood-grain |
|---|---|---|---|
| 320px | mobile (<480) | no h-scroll ✓ · tray opens, fits, no inner overflow ✓ | no h-scroll ✓ · tray ✓ |
| 390px | mobile | ✓ · tray full-width ✓ | ✓ · tray full-width ✓ |
| 480px | mobile/tablet boundary | ✓ · tray 420px panel, fits ✓ | ✓ · tray ✓ |
| 768px | tablet (481–900) | ✓ · tray ✓ | ✓ · tray ✓ |
| 1024px | desktop (901+) | ✓ · tray ✓ | ✓ · tray ✓ |
| 1440px | desktop | ✓ · tray ✓ | ✓ · tray ✓ |

- **No layout breakage or horizontal scroll at any breakpoint** — `scrollWidth − innerWidth ≤ 0` on both pages at all widths (24/24 pass).
- **Responsive header (client report: "not responsive at all" — fixed this pass)** — the desktop row (logo + 6 collection links + Request) squeezed into broken slivers below 900px. Now: ≤900px the links collapse into a native `<details>` disclosure — **zero JS, keyboard-accessible, works with JS off**; logo + Menu + Request all fit at 320px; the panel is a full-width dropdown under the sticky header with 45px tap rows in the design system's hairline language. Verified geometrically (16/16 checks): desktop shows links/hides menu, ≤900 hides links/shows menu, elements never overlap at 320, panel opens anchored to the header, closes with nothing painted or hit-testable (pixel-identical captures), label flips Menu→Close, accessible name stays "Menu", tray unaffected.
- **Tray/drawer usable at all breakpoints** — opens, settles fully inside the viewport (full-width panel ≤390px, 420px right panel above), zero inner horizontal overflow at every width (24/24 pass).
- Note: the drawer is measured *after* its slide-in transition settles (~800 ms) — mid-animation measurements are not meaningful.
- Focus-trap keyboard verification (M5) also passes at runtime: 6/6 checks in headless Chrome.

## Browser matrix

| Browser | Status | Notes |
|---|---|---|
| Latest Chrome (desktop) | ✅ Tested | Headless + real window, all breakpoints above |
| Latest Chrome (Android emulated) | ⛔ Not run | Needs Android device/emulator (adb or Chrome DevTools device mode) — human/device pass |
| Latest Safari | ⛔ Not run | Needs a Mac Safari pass (safaridriver usually disabled) — human pass |
| Latest Firefox | ⛔ Not run | Firefox not present in this environment — human pass |
| Latest Edge | ⛔ Not run | Not present — human pass (Chromium engine; risk low, still required) |
| iOS Safari | ⛔ Not run | Needs real device or Xcode simulator — human/device pass |

## Client bugfix pass ("Three technical issues") — verified 17/17

Harness: `/tmp/three-fixes-check.mjs` (headless Chrome over CDP, 390×844) against the built `dist` on the gzip harness.

| Issue | Root cause | Fix | Runtime check |
|---|---|---|---|
| Header Request button + homepage CTA count never updates | `RequestTray.svelte` `syncButtons()` never touched `[data-tray-count]` — static `(0)` since M4 | `syncButtons()` writes `(${totalQty})` into every `[data-tray-count]` + updates the owning button's `aria-label` (screen-reader users hear the count) | (0) → (1) → (2) → (1) in header and CTA in lockstep; aria-label "Open request tray — 1 sample selected" ✓ |
| Homepage CTA doesn't open the tray | `StatementBanner.astro` button was a dead M4 placeholder (`title="Request tray arrives in M4"`, never wired) | `data-tray-open` + live `[data-tray-count]` span inside the button | Clicking the CTA opens the drawer showing the selected sample ✓ |
| Mobile menu "not working" on /request | `/request` + `/thank-you` rendered `<Nav hideTray />` with no `collections` → menu panel had zero links (empty dropdown) | Both pages query `collections` and pass them to Nav | Menu opens on `/request/` + `/thank-you/` showing all 6 `/collections/…` links ✓ |

⚠️ **Out-of-band revert:** after verification, an external edit restored `src/pages/request.astro` to `<Nav hideTray />` without collections — `/request` is back to an empty menu panel in source (thank-you keeps the fix). Flagged to the client; one-line restore pending.

## Hero restructure (client directive: no absolute elements) — verified 17/17

`src/components/Hero.astro` rewritten: **zero absolute/fixed elements**; the photo is the section's CSS `background-image` (the `--hero-veil` scrim gradient layered as the first background layer — no veil div); the floating material callout is gone; content is normal-flow, `display:flex; align-items:center`, left-aligned at `--gutter`, headline → sub → link unchanged. Perf preserved with three build-time WebP tiers (640/1280/1920) behind `@media` rules, and the homepage LCP preload widths aligned so preload and background resolve to the same candidate — **exactly 1 hero-001 request per page load**.

Harness: `/tmp/hero-flex-check.mjs`. Checks: no absolute/fixed inside `.hero`, callout/veil/img gone, gradient + image background, 3 tiers in the stylesheet, correct tier at 390/1024/1440, content vertically centered (±3 px) and left-aligned at the gutter, y-order h1 → sub → link, all visible, no horizontal scroll, single hero request. Re-run after the restructure: homepage tray wiring still 9/9.

## Still open

- **M5 Lighthouse gate re-run** — the ≥90 four-way gate straddles the line due to simulator variance (desktops 100/100; mobiles bounce 85–98 home / 86–99 collection). Re-run on a quiet machine as part of this QA pass; full numbers in PRD §10 Session 9.
- **Human visual pass** — the standing shared acceptance (M1 + M2 residuals + M3 + M4 tray/form click-through + the hero restructure at 1440/390 — the callout is intentionally gone per client directive) settles M6's "no layout breakage" for eyeballs, plus Safari/Firefox/Edge/iOS/Android rows above.

## How to re-run

```sh
npm run build
node scripts/serve-gzip.mjs &           # serves dist/client on :4328
node /tmp/breakpoint-sweep.mjs          # 24 assertions, exit 0 = pass
node /tmp/three-fixes-check.mjs         # 17 assertions — tray counts, CTA opens tray, mobile menus
node /tmp/hero-flex-check.mjs           # 17 assertions — hero restructure (no absolute, bg tiers)
```

(If `node` isn't on PATH: `/Users/macbookpro/.nvm/versions/node/v24.19.0/bin/node`.)
