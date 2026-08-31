// M2: finalize alt text + descriptions for all product JSONs.
// Grounded in *measured* swatch colour/texture stats (swatch-color-stats.mjs),
// not vision or invention. Preserves code/name/collection/image/tags/featured/order.
// Usage: node scripts/finalize-product-copy.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PRODUCT_DIR = 'src/content/products';

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

// Measured (h,s,l) → polished colour phrase, with "a"/"an" article.
function colourPhrase(h, s, l) {
  const light = (w) => (w === 'near-black' || w === 'off-white' ? w : `a ${w}`);
  if (s < 0.13) {
    if (l < 0.16) return light('near-black');
    if (l < 0.35) return light('dark grey');
    if (l < 0.6) return light('mid-grey');
    if (l < 0.8) return light('light grey');
    return light('off-white');
  }
  let hue;
  if (h < 25) {
    // red/orange territory — brown-family for mid/dark tones, pink for light
    if (l > 0.7) hue = 'pink';
    else if (l < 0.6 && s < 0.5) hue = 'red-brown';
    else if (l < 0.6) hue = 'red-brown';
    else hue = 'pink-brown';
  } else if (h < 40) {
    hue = l > 0.45 ? 'brown' : 'dark brown';
  } else if (h < 55) {
    hue = s > 0.5 ? 'golden' : 'tan';
  } else if (h < 75) hue = 'olive';
  else if (h < 165) hue = 'green';
  else if (h < 200) hue = 'teal';
  else if (h < 255) hue = 'blue';
  else if (h < 285) hue = 'indigo';
  else if (h < 330) hue = 'violet';
  else hue = l > 0.7 ? 'pink' : 'rose';
  let lightWord;
  if (l < 0.16) lightWord = 'very dark';
  else if (l < 0.35) lightWord = 'dark';
  else if (l < 0.6) lightWord = 'mid';
  else if (l < 0.75) lightWord = 'light';
  else lightWord = 'pale';
  // Collision cleanup: 'dark brown' as hue already carries a darkness word.
  if (hue === 'dark brown') {
    if (lightWord === 'mid') return light('deep brown');
    if (lightWord === 'dark') return light('dark brown');
    if (lightWord === 'very dark') return light('very dark brown');
  }
  if (hue === 'tan' && (lightWord === 'dark' || lightWord === 'very dark')) {
    return light('deep tan');
  }
  return light(`${lightWord} ${hue}`);
}

// Per-collection alt/description nouns and texture clauses.
const FAMILY = {
  'wood-grain': { noun: 'Wood-grain panel swatch', nounDesc: 'Wood-grain panel', flat: 'with fine grain', textured: 'with visible grain', strong: 'with pronounced grain' },
  'stone-marble': { noun: 'Marble-effect panel swatch', nounDesc: 'Marble-effect panel', flat: '', textured: 'with veining', strong: 'with pronounced veining' },
  metal: { noun: 'Metal panel swatch', nounDesc: 'Metal panel', flat: 'with an even metal surface', textured: 'with visible machining', strong: 'with pronounced machined texture' },
  textile: { noun: 'Fabric-wrapped panel swatch', nounDesc: 'Fabric-wrapped panel', flat: '', textured: 'with visible weave', strong: 'with a pronounced woven surface' },
  solid: { noun: 'Solid-colour panel swatch', nounDesc: 'Solid-colour panel', flat: '', textured: 'with subtle tonal variation', strong: 'with pronounced tonal variation' },
  'glossy-decorative': { noun: 'High-gloss decorative panel swatch', nounDesc: 'High-gloss decorative panel', flat: 'with a high-gloss finish', textured: 'with a reflective high-gloss finish', strong: 'with a mirror-reflective high-gloss finish' },
};

// Hand overrides where the auto phrase needs better wording (from stats review).
const OVERRIDES = {
  'MM-131': { alt: 'Marble-effect panel swatch in near-white with a faint violet tint.', desc: 'Marble-effect panel in a near-white tone with a faint violet tint.' },
  'MM-132': { alt: 'Marble-effect panel swatch in near-white with a faint olive tint.', desc: 'Marble-effect panel in a near-white tone with a faint olive tint.' },
  'MS-101': { alt: 'Matte solid-colour panel swatch in a pale blue-white.', desc: 'Matte solid-colour panel in a pale blue-white tone.' },
  'MS-102': { alt: 'Matte solid-colour panel swatch in a bright orange.', desc: 'Matte solid-colour panel in a bright orange tone.' },
  'HGS-241': { alt: 'High-gloss solid-colour panel swatch in near-black with a blue undertone.', desc: 'High-gloss solid-colour panel in near-black with a blue undertone.' },
  'HGF-245': { alt: 'High-gloss decorative panel swatch in pearl white with a reflective lacquer finish.', desc: 'High-gloss decorative panel in pearl white with a reflective finish.' },
};

// Codes whose existing alt/description are already real copy (kept verbatim).
const KEEP_EXACT = new Set(['WG-01', 'WG-02']);
const KEEP_ALT = new Set([]);

const files = fs.readdirSync(PRODUCT_DIR).filter((f) => f.endsWith('.json')).sort();
let rewritten = 0;
for (const f of files) {
  const filePath = path.join(PRODUCT_DIR, f);
  const p = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (KEEP_EXACT.has(p.code)) continue;

  const imgRel = p.swatchImage.replace('../../assets/', '').replaceAll('/', path.sep);
  const imgAbs = path.join('src/assets', imgRel);
  const img = sharp(imgAbs, { failOn: 'none' }).resize(32, 32, { fit: 'fill' });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const n = data.length / ch;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < n; i++) { r += data[i * ch]; g += data[i * ch + 1]; b += data[i * ch + 2]; }
  r /= n; g /= n; b /= n;
  const [h, s, l] = rgbToHsl(r, g, b);
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
  const family = FAMILY[p.collection];
  if (!family) throw new Error(`unknown collection ${p.collection}`);
  const texture = std < 0.08 ? family.flat : std < 0.18 ? family.textured : family.strong;
  const colour = colourPhrase(h, s, l);

  const override = OVERRIDES[p.code];
  const alt = override?.alt ?? `${family.noun} in ${colour}${texture ? ' ' + texture : ''}.`;
  const desc = override?.desc ?? `${family.nounDesc} in ${colour}${texture ? ' ' + texture : ''}.`;
  p.alt = alt;
  p.description = desc;
  fs.writeFileSync(filePath, JSON.stringify(p, null, 2));
  rewritten++;
  console.log(p.code, '→', alt);
}
console.log(`\nrewrote ${rewritten} product files`);
