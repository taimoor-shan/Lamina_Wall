// M2 helper: compose a labeled contact sheet per collection so swatch content
// can be inspected in one image per collection (for writing real alt text).
// Usage: node scripts/contact-sheet.mjs <out-dir>
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = process.argv[2] ?? '/tmp/lamina-sheets';
fs.mkdirSync(outDir, { recursive: true });

const CELL_W = 220;
const THUMB_W = 200;
const THUMB_H = 150;
const LABEL_H = 30;
const COLS = 4;

const root = 'src/assets/products';
for (const coll of fs.readdirSync(root).sort()) {
  const dir = path.join(root, coll);
  if (!fs.statSync(dir).isDirectory()) continue;
  const files = fs.readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .sort((a, b) => {
      // numeric-aware sort so wg-2 < wg-10
      const n = (s) => s.replace(/\d+/, (m) => String(m).padStart(4, '0'));
      return n(a).localeCompare(n(b));
    });
  const rows = Math.ceil(files.length / COLS);
  const W = COLS * CELL_W;
  const H = rows * (THUMB_H + LABEL_H);
  const layers = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const x = (i % COLS) * CELL_W;
    const y = Math.floor(i / COLS) * (THUMB_H + LABEL_H);
    const src = path.join(dir, f);
    const code = f.replace(/\.[a-z]+$/i, '').toUpperCase();
    // Pre-resize the swatch to the thumb box (composite layers do not resize).
    const thumb = await sharp(src, { failOn: 'none' })
      .resize(THUMB_W, THUMB_H, { fit: 'contain', background: '#f4f1ec' })
      .flatten({ background: '#f4f1ec' })
      .png()
      .toBuffer();
    const cellBg = { input: { create: { width: CELL_W, height: THUMB_H + LABEL_H, channels: 3, background: '#f4f1ec' } }, top: y, left: x };
    const cellImg = { input: thumb, top: y, left: x + (CELL_W - THUMB_W) / 2, position: 'centre' };
    // label drawn as SVG overlay below the thumb
    const label = Buffer.from(
      `<svg width="${CELL_W}" height="${LABEL_H}">
        <text x="${CELL_W / 2}" y="18" font-family="monospace" font-size="13"
              text-anchor="middle" fill="#222">${code}</text>
      </svg>`
    );
    layers.push(cellBg, cellImg, { input: label, top: y + THUMB_H, left: x });
  }
  const out = path.join(outDir, `${coll}.png`);
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite(layers)
    .png()
    .toFile(out);
  console.log('wrote', out, `${files.length} swatches`);
}
