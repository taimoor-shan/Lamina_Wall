// Catalogue generator (PRD §3.4, Phase 2 R1).
//
// Reads data/catalogue-master.ts (the single source for all 258 codes) and
// emits/updates src/content/products/*.json — lowercased code = filename
// (letter suffixes included: hgm-276a.json). Existing product files with
// real photography keep their swatchImage/alt/description/tags/featured;
// every other field is overwritten from the master. Products with no real
// image get the shared placeholder tile + imageStatus "placeholder".
//
// The script exits non-zero on any disagreement with the taxonomy's hard
// numbers (family and series counts from PRD §3.4), on duplicate codes, on
// unknown series, or if any pre-existing real-image product other than the
// three known exclusions (WG-37, WG-43, HGF-252 — codes absent from the
// manufacturer index, quarantined per Session 12) would be dropped.
//
// Run:  node --no-warnings scripts/generate-catalogue.mjs

import { mkdirSync, readdirSync, readFileSync, existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Node ≥23.6 strips TS types natively — the master file is imported as-is.
const { CATALOGUE, SERIES } = await import('../data/catalogue-master.ts');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const productsDir = join(root, 'src/content/products');
const assetsDir = join(root, 'src/assets/products');

const PLACEHOLDER_REF = '../../assets/products/placeholder-missing.png';
const PLACEHOLDER_ALT = 'Product image not yet available';

// Hard numbers from PRD §3.4 — do not change here; change the master instead.
const EXPECTED_FAMILY = { 'wood-grain': 63, 'stone-marble': 50, metal: 28, textile: 47, solid: 33, 'glossy-decorative': 37 };
const EXPECTED_SERIES = { wg: 43, imo: 12, pwv: 8, 'mm-matte-marble': 14, 'mm-travertine': 5, hgm: 18, tdm: 13, bm: 6, msm: 6, eb: 10, kpm: 6, fg: 30, cbm: 10, pp: 7, ms: 24, hgs: 5, hgf: 4, pm: 17, amf: 20 };

// Known exclusions: pre-existing products with real photos whose codes are
// NOT in the manufacturer index. Quarantined, not deleted — Session 12.
const KNOWN_EXCLUSIONS = new Set(['wg-37', 'wg-43', 'hgf-252']);

const familyOf = (series) => SERIES.find((s) => s.slug === series).family;
const filenameOf = (code) => `${code.toLowerCase()}.json`;

/* ---------- master sanity (hard-fail on any inconsistency) ---------- */

const codes = CATALOGUE.map((p) => p.code);
const dupes = codes.filter((c, i) => codes.indexOf(c) !== i);
if (dupes.length) fail(`duplicate codes in master: ${dupes.join(', ')}`);

const unknownSeries = CATALOGUE.filter((p) => !SERIES.some((s) => s.slug === p.series));
if (unknownSeries.length) fail(`products reference unknown series: ${[...new Set(unknownSeries.map((p) => p.series))].join(', ')}`);

const byFamily = {};
const bySeries = {};
for (const p of CATALOGUE) {
  byFamily[familyOf(p.series)] = (byFamily[familyOf(p.series)] ?? 0) + 1;
  bySeries[p.series] = (bySeries[p.series] ?? 0) + 1;
}
const familyDiff = Object.entries(EXPECTED_FAMILY).filter(([f, n]) => byFamily[f] !== n);
const seriesDiff = Object.entries(EXPECTED_SERIES).filter(([s, n]) => bySeries[s] !== n);
if (familyDiff.length || seriesDiff.length) {
  fail(
    `taxonomy count mismatch — family: ${JSON.stringify(familyDiff)}; series: ${JSON.stringify(seriesDiff)}`,
  );
}
console.log(`master ok: ${CATALOGUE.length} codes (family ${JSON.stringify(byFamily)})`);

/* ---------- resolution helpers ---------- */

const existingByFile = new Map();
for (const f of readdirSync(productsDir).filter((f) => f.endsWith('.json'))) {
  existingByFile.set(f, JSON.parse(readFileSync(join(productsDir, f), 'utf8')));
}

const realImageFor = (product) => {
  const family = familyOf(product.series);
  const base = join(assetsDir, family, product.code.toLowerCase());
  for (const ext of ['.png', '.jpg']) {
    if (existsSync(`${base}${ext}`)) return { file: `${product.code.toLowerCase()}${ext}`, ext };
  }
  return null;
};

/* ---------- emit ---------- */

// Pre-existing products with a REAL (non-placeholder) swatchImage file on
// disk — these must all survive the run as imageStatus "real" (unless a known
// exclusion). The placeholder ref itself exists on disk, so it is excluded
// here: a placeholder→placeholder product is not a "lost real image".
const previouslyReal = new Set();
for (const [file, prev] of existingByFile) {
  if (prev.swatchImage && prev.swatchImage !== PLACEHOLDER_REF && existsSync(join(productsDir, prev.swatchImage))) {
    previouslyReal.add((prev.code ?? file.replace(/\.json$/, '')).toLowerCase());
  }
}

const emitted = new Set();
const emittedReal = new Set();
let realCount = 0;

CATALOGUE.forEach((product, i) => {
  const file = filenameOf(product.code);
  const prev = existingByFile.get(file);
  const img = realImageFor(product);
  const family = familyOf(product.series);

  const out = {
    code: product.code,
    name: product.name,
    collection: family,
    series: product.series,
    subcategory: product.subcategory,
  };

  if (img && prev) {
    // Real photography — preserve the curated fields, keep the alt truthful.
    realCount += 1;
    emittedReal.add(product.code.toLowerCase());
    out.imageStatus = 'real';
    out.swatchImage = `../../assets/products/${family}/${img.file}`;
    if (prev.alt) out.alt = prev.alt;
    if (prev.description) out.description = prev.description;
    if (Array.isArray(prev.tags)) out.tags = prev.tags;
    if (typeof prev.featured === 'boolean') out.featured = prev.featured;
  } else if (img && !prev) {
    fail(`real image ${family}/${img.file} exists but product file ${file} is missing — refusing to fabricate alt text; add the product JSON first`);
  } else {
    out.imageStatus = 'placeholder';
    out.swatchImage = PLACEHOLDER_REF;
    out.alt = PLACEHOLDER_ALT;
  }

  out.order = i + 1; // canonical position: family → series → code order in master
  writeFileSync(join(productsDir, file), `${JSON.stringify(out, null, 2)}\n`);
  emitted.add(file);
});

/* ---------- stale-file sweep (log every removal) ---------- */

for (const [file, prev] of existingByFile) {
  if (!emitted.has(file)) {
    const code = prev?.code ?? file.replace(/\.json$/, '');
    const known = KNOWN_EXCLUSIONS.has(code.toLowerCase());
    if (!known) fail(`stale product ${file} (${code}) would be dropped and is not a known exclusion`);
    console.log(`  excluding ${file} (${code} — absent from manufacturer index; photo quarantined, Session 12)`);
    unlinkSync(join(productsDir, file));
  }
}

/* ---------- audit ---------- */

// Data-loss guard: every previously-real image must be real now.
const lostReal = [...previouslyReal].filter((code) => !KNOWN_EXCLUSIONS.has(code) && !emittedReal.has(code));
if (lostReal.length) {
  fail(`previously real images lost to placeholder: ${lostReal.join(', ')} — check asset folder placement`);
}

console.log(`emitted ${emitted.size} product files`);
console.log(`imageStatus real: ${realCount} · placeholder: ${CATALOGUE.length - realCount}`);
for (const fam of [...new Set(SERIES.map((s) => s.family))]) {
  const series = SERIES.filter((s) => s.family === fam);
  const lines = series.map((s) => `${s.slug}=${bySeries[s.slug]}`).join(' ');
  console.log(`  ${fam}: ${byFamily[fam]}  (${lines})`);
}

function fail(msg) {
  console.error(`✗ catalogue check failed: ${msg}`);
  process.exit(1);
}
