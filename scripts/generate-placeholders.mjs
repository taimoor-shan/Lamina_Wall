// Placeholder image generator for M0 pipeline proof.
// Generates flat material-toned placeholder images at the aspect ratios the
// mockup establishes: swatches 4:2.7 (1200x810), application/hero 16:8.4
// (1800x945). These are PROVISIONAL — M2 replaced them with the real
// catalogue pipeline. Files that already exist are SKIPPED, never
// overwritten — real photography must survive a rerun.
//
// Phase 2 (R1): also generates the shared catalogue placeholder tile
// src/assets/products/placeholder-missing.png (PRD §3.4) — a neutral
// paper-toned tile with a hairline border and a centred mono
// "IMAGE MISSING" label, in the design-system tokens.
//
// Run:  node scripts/generate-placeholders.mjs

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToStr([r, g, b]) {
  return `rgb(${r},${g},${b})`;
}

// Shared catalogue placeholder tile (PRD §3.4): --paper background,
// hairline --line border, centred mono "IMAGE MISSING" in --ink.
// 1200x810 keeps the mockup's established 4:2.7 swatch ratio; grid cells
// crop with object-fit: cover regardless.
async function placeholderMissing({ file, width = 1200, height = 810 }) {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#fbf9f4"/>
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#c9c1ae" stroke-width="1.5"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
      font-family="'Space Mono', ui-monospace, 'SF Mono', monospace"
      font-size="56" letter-spacing="10" fill="#1b1914">IMAGE MISSING</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(file);
  process.stdout.write(`  ✓ ${file}\n`);
}

async function swatch({ file, from, to, lines, width = 1200, height = 810 }) {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  // Vertical gradient
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${rgbToStr([r1, g1, b1])}"/>
        <stop offset="1" stop-color="${rgbToStr([r2, g2, b2])}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>`;
  // Grain / vein lines
  for (let i = 0; i < (lines ?? 14); i++) {
    const y = Math.floor(Math.random() * height);
    const h = 2 + Math.floor(Math.random() * 7);
    const a = 0.05 + Math.random() * 0.1;
    svg += `<rect x="0" y="${y}" width="100%" height="${h}" fill="#000000" opacity="${a}"/>`;
  }
  svg += `</svg>`;
  if (existsSync(file)) {
    process.stdout.write(`  skip (already exists — real asset?) ${file}\n`);
    return;
  }
  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(file);
  process.stdout.write(`  ✓ ${file}\n`);
}

const specs = [
  // Legacy M0 spec paths — retired: real photography now lives in
  // family-named subfolders (src/assets/products/<family>/), and real
  // assets are never overwritten. `swatch()` above remains as a guarded
  // helper for future provisional imagery.
];

for (const spec of specs) {
  mkdirSync(dirname(spec.file), { recursive: true });
  await swatch(spec);
}

// The shared catalogue "missing photography" tile (Phase 2 R1, PRD §3.4).
mkdirSync(join(root, 'src/assets/products'), { recursive: true });
if (!existsSync(join(root, 'src/assets/products/placeholder-missing.png'))) {
  await placeholderMissing({ file: join(root, 'src/assets/products/placeholder-missing.png') });
} else {
  process.stdout.write('  skip (exists) src/assets/products/placeholder-missing.png\n');
}

process.stdout.write('Placeholder images generated.\n');