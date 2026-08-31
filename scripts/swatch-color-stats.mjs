// M2 helper: measure per-swatch colour + texture statistics so factual alt
// text and descriptions can be written without relying on vision.
// Usage: node scripts/swatch-color-stats.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      default: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return [h, s, l];
}

// Map (h, s, l) → plain-English colour descriptor.
function describeColor(h, s, l) {
  const light = l < 0.16 ? 'near-black' : l < 0.33 ? 'dark' : l < 0.55 ? 'mid-' : l < 0.75 ? 'light' : 'very light';
  const neutral = s < 0.13;
  if (neutral) {
    if (l < 0.16) return 'near-black';
    if (l < 0.35) return 'dark grey';
    if (l < 0.6) return 'mid-grey';
    if (l < 0.8) return 'light grey';
    return 'off-white';
  }
  let hue;
  if (h < 15) hue = 'red';
  else if (h < 40) hue = l > 0.4 ? 'brown' : 'dark brown';
  else if (h < 55) hue = s > 0.5 ? 'golden' : 'tan';
  else if (h < 75) hue = 'olive';
  else if (h < 165) hue = 'green';
  else if (h < 200) hue = 'teal';
  else if (h < 255) hue = 'blue';
  else if (h < 285) hue = 'indigo';
  else if (h < 330) hue = 'violet';
  else hue = 'rose';
  const warm = h >= 15 && h < 90;
  return `${light}${neutral ? '' : ' ' + hue}${warm && !neutral && l < 0.55 ? '' : ''}`.trim();
}

const root = 'src/assets/products';
const rows = [];
for (const coll of fs.readdirSync(root).sort()) {
  const dir = path.join(root, coll);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).filter((x) => !x.startsWith('.'))) {
    const src = path.join(dir, f);
    const img = sharp(src, { failOn: 'none' }).resize(32, 32, { fit: 'fill' });
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    const n = data.length / ch;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < n; i++) { r += data[i * ch]; g += data[i * ch + 1]; b += data[i * ch + 2]; }
    r /= n; g /= n; b /= n;
    const [h, s, l] = rgbToHsl(r, g, b);
    // lightness spread → texture signal (grain/veining/weave vs flat solid)
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const li = (Math.min(data[i * ch], data[i * ch + 1], data[i * ch + 2]) + Math.max(data[i * ch], data[i * ch + 1], data[i * ch + 2])) / 2 / 255;
      sum += li;
    }
    const mean = sum / n;
    let v = 0;
    for (let i = 0; i < n; i++) {
      const li = (Math.min(data[i * ch], data[i * ch + 1], data[i * ch + 2]) + Math.max(data[i * ch], data[i * ch + 1], data[i * ch + 2])) / 2 / 255;
      v += (li - mean) ** 2;
    }
    const std = Math.sqrt(v / n);
    const spread = std < 0.08 ? 'flat' : std < 0.18 ? 'subtle-texture' : std < 0.3 ? 'textured' : 'high-contrast';
    const code = f.replace(/\.[a-z]+$/i, '').toUpperCase();
    rows.push({
      coll, code,
      rgb: `${Math.round(r)},${Math.round(g)},${Math.round(b)}`,
      hsl: `${Math.round(h)} ${(s * 100).toFixed(0)} ${(l * 100).toFixed(0)}`,
      desc: describeColor(h, s, l),
      spread,
    });
  }
}
rows.sort((a, b) => a.coll.localeCompare(b.coll) || a.code.localeCompare(b.code, undefined, { numeric: true }));
for (const r of rows) console.log([r.coll, r.code, r.desc, r.rgb, r.hsl, r.spread].join('\t'));
