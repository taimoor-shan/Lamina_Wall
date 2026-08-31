// Placeholder image generator for M0 pipeline proof.
// Generates flat material-toned placeholder images at the aspect ratios the
// mockup establishes: swatches 4:2.7 (1200x810), application/hero 16:8.4
// (1800x945). These are PROVISIONAL — M2 replaces them with the real
// catalogue pipeline (real grain/vein photography per PRD §3.3).
//
// Run after `npm install`:  node scripts/generate-placeholders.mjs

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
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
  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(file);
  process.stdout.write(`  ✓ ${file}\n`);
}

const specs = [
  // Product swatches
  { file: join(root, 'src/assets/products/wg-01.jpg'), from: '#8a5a2b', to: '#5e3a18', lines: 22 },
  { file: join(root, 'src/assets/products/wg-02.jpg'), from: '#d9c49a', to: '#b29768', lines: 18 },
  { file: join(root, 'src/assets/products/mm-144.jpg'), from: '#2a2624', to: '#0b0a09', lines: 10 },
  // Collection application / hero shots
  { file: join(root, 'src/assets/applications/app-wood-grain.jpg'), from: '#a06a33', to: '#4a2e13', width: 1800, height: 945, lines: 26 },
  { file: join(root, 'src/assets/applications/app-stone-marble.jpg'), from: '#6b6b68', to: '#232220', width: 1800, height: 945, lines: 10 },
  { file: join(root, 'src/assets/applications/app-metal.jpg'), from: '#9aa0a6', to: '#3c4044', width: 1800, height: 945, lines: 34 },
  { file: join(root, 'src/assets/applications/app-textile.jpg'), from: '#7d7466', to: '#3a352c', width: 1800, height: 945, lines: 40 },
];

for (const spec of specs) {
  mkdirSync(dirname(spec.file), { recursive: true });
  await swatch(spec);
}
process.stdout.write('Placeholder images generated.\n');