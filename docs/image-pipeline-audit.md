# Image Pipeline Audit — M2 (PRD §3.3 spot-check)

Date: 2026-09-01 · Milestone: M2 — Content Migration · Result: **PASS with notes**

## Sources

- All imagery originates from the client-supplied catalogue crops in `reference/assets/` (extracted from the source catalogue `lamina-wall.pdf`, 119 pages) and was copied into `src/assets/` during Sessions 3–5, renamed to the PRD §3.3 convention: code (lowercased) = JSON filename = image filename.
- `src/assets/products/<collection-slug>/` — 92 swatches across 6 collections.
- `src/assets/applications/<collection-slug>/` — 18 application photos (primary `app-<slug>` + alternates), plus `hero-001.jpeg` (site hero, 2093×1339).

## Pipeline steps (M2 checklist)

| Step | Status | Evidence |
|---|---|---|
| 1. Extract from source catalogue/PDF | ✅ | `reference/assets/` crops; PDF retained at repo root |
| 2. Crop to established aspect ratio per role | ✅ | **Swatches:** PRD §3.3 option 2 chosen consistently — native crops + fixed-aspect CSS container with `object-fit: cover` (same approach as the approved mockup). Measured ratio range 1.07–3.76 across all 92 (PRD anticipated 2.6:1–4.5:1; the wider range is the catalogue's, handled uniformly by option 2). **Applications:** consistent 1672×941 (1.78) primaries; hero 1.56. |
| 3. Retouch | ✅ | Not required — catalogue crops used as-is, no misrepresentation risk |
| 4. Rename to code convention | ✅ | Verified: every product JSON's `swatchImage` resolves into its collection's folder; 0 stray files |
| 5. Place in `src/assets/` | ✅ | Per-collection folders (Session 5 client directive) |
| 6. Confirm `astro:assets` output | ✅ | See below |
| 7. Real alt text for every image | ✅ | 92 swatch alts + 6 hero alts + 6 secondary alts, all non-filler (see methodology below) |

## astro:assets output verification (build `2026-09-01`)

- Build emits **265 WebP files, 0 original-format images** shipped to the browser (verified in `dist/client/_astro/` and `dist/client/index.html`).
- Every swatch emits a responsive `srcset`; **no candidate exceeds its source resolution** — e.g. 420px source → single `420w` entry; 678px source → `480w, 678w`; 1100px source → `480w, 720w`. No upscaling anywhere in the pipeline.
- Application images: `640w, 1024w, 1672w` (source 1672×941).
- Hero: `hero-001.jpeg` (2093×1339) → WebP @ 1920w — the only image meeting the full §3.3 ~1800px+ target.
- **Note:** the adapter's `compile` image service emits **WebP only** — AVIF is not generated despite the `formats` prop (verified: `formats: ['avif', 'webp']` on `<Image>` produces identical output; the compile service's format set is adapter-enforced). PRD §3.3's intent — build-time optimized output, no originals shipped, responsive srcset — is met. WebP covers all target browsers; revisit AVIF if the adapter adds support.

## Resolution / aspect-ratio spot-check (§3.3 acceptance)

| Class | Count | Source widths | Rendered max (2× density) | Verdict |
|---|---|---|---|---|
| Swatches ≥ ~1000px wide (wood wg-21+, imo-15x, stone hgm/mm 132+, tdm, metal, glossy, textile fg-61–63/69/70, solid hgs) | 54 | 1048–1200px | ~500px | ✅ comfortably above |
| Swatches 400–760px wide (wg-03…20, wg-25–28, fg-64–68, mm-131, ms-101…106, fg subset) | 38 | 420–758px | ~500px (2× of ~250px grid cell) | ⚠️ at or slightly under 2× — 1× renders sharp; 2× renders slightly soft. These are the only source material the client supplied; no higher-res originals exist in `reference/assets/`. |
| Application primaries | 6 + hero | 1672×941 (hero 2093×1339) | 1672–1920px | ⚠️ 1672px ≈ 93% of the §3.3 ~1800px target. **PRD §3.3 recommends an AI upscale pass (Topaz Gigapixel / Real-ESRGAN) on hero + application images before final delivery** — client-side task; until then the build serves the native 1672px crop (which exceeds the original 950–1030px scans the PRD measured). |

Swatch cropping approach: **option 2** (native ratios + CSS `object-fit: cover`) — consistent across the whole launch set, per §3.3's "pick one and apply it consistently".

## Alt text methodology (M2 step 7)

All 92 swatch alts and descriptions were rewritten from **measured image properties** (32×32 downsample: mean RGB → HSL colour descriptor; lightness standard deviation → texture signal), combined with the collection's material family (wood-grain / stone-marble / metal / textile / solid / glossy-decorative). This guarantees every alt is a plain, truthful description of what the image shows — no invented finish or material claims. The previous templated alts ("…swatch, CODE." with a stray double space) and the unverifiable descriptive alts from Sessions 3–4 (e.g. MS-102 "deep near-black onyx" — actually bright orange) were replaced.

Two products keep their authored copy: WG-01, WG-02 (their alts/descriptions reference the approved mockup; `name`s appear in client-facing copy).

## Remaining notes

- **Product `name`s:** 12 products carry descriptive names (e.g. WG-01 "Classic Technology Wood"); the rest use `name = code` per the client's Session 4 directive. Two names appear inconsistent with the measured imagery (MS-102 "Onyx Matte" measures bright orange; PM-263 "Noir Gloss" measures mid teal) — flagged in the PRD session log for the client's decision (open question from Session 4).
- **AI upscale pass** for application/hero imagery remains a client-side item before final delivery (PRD §3.3).
