/**
 * LAMINA catalogue master — the single source for all 258 product codes
 * (PRD §3.4, Phase 2 R1).
 *
 * Transcribed from `subcategory-taxonomy.md` (the source of truth) plus the
 * manufacturer's own index pages (per-code printed names). Edit THIS file and
 * re-run `node scripts/generate-catalogue.mjs` — never hand-edit the emitted
 * product JSONs en masse.
 *
 * Conventions locked here (deliberate decisions, see §10 Session 12):
 *
 * 1. Fields per code: `code` (display form, e.g. "HGM-276A"), `series` slug,
 *    `subcategory` label, `name` (display name), `nameSource` (which rule
 *    produced `name` — see PRD §3.4 name policy). `family` and `order` are
 *    NOT stored per row: family comes from the SERIES table below (a series
 *    belongs to exactly one family), and the generator stamps `order` as the
 *    row's canonical position 1…258.
 *
 * 2. `nameSource` vocabulary:
 *    - 'printed'     — the per-code printed name from the manufacturer index
 *                      (case/punctuation harmonized per the taxonomy).
 *    - 'normalized'  — printed name with a deliberate, documented change:
 *        * AMF-323 "Triumphal Arch - Bronze" → "Triumphal Gate - Bronze"
 *          (typo; siblings 321/322/324 print "Gate").
 *        * AMF-325–328: "cylinder/Cylinder" case + missing-letter variant
 *          normalized to "Small Cylinder".
 *        * TDM-301…316: series-wide "(Integrated)" qualifier stripped (every
 *          TDM code carries it — redundant at product level).
 *        * PP-191…197: series-wide "-PP" suffix stripped (same rationale).
 *        * MS-107–109: shared parenthetical "(Lichi Leather)" stripped from
 *          the name because the subcategory field carries it.
 *    - 'subcategory' — rule 4 fallback (name = subcategory label). Unused in
 *                      the current 258: every code has a recoverable printed
 *                      or printed-derived name.
 *
 * 3. Hyphenated descriptor names print with a spaced hyphen
 *    ("Triumphal Gate - Silver", "Pit - Bronze") — the PRD's own format for
 *    the AMF-323 normalization; parenthetical qualifiers keep one space
 *    ("Impara Black (Matte)", "Skin Sensory Khaki (dark)").
 *
 * 4. Exclusions (logged for a human, not silently dropped — see §10):
 *    the repo previously shipped WG-37, WG-43 and HGF-252 with real photos,
 *    but the manufacturer's index (and this master) do not list those codes
 *    (WG-37 and WG-43–47 are numbering gaps; HGF is 245/246/248/249 only).
 *    Their photos are quarantined in reference/assets; the client checks
 *    them against the physical catalogue. Adding them back = new rows here.
 *
 * 5. MSM series codes are MSM-211…216 (from the index pages; the taxonomy
 *    table omitted code numbers).
 */

/* ------------------------------------------------------------------------- */

export type FamilySlug =
  | 'wood-grain'
  | 'stone-marble'
  | 'metal'
  | 'textile'
  | 'solid'
  | 'glossy-decorative';

export type SeriesSlug =
  | 'wg'
  | 'imo'
  | 'pwv'
  | 'mm-matte-marble'
  | 'mm-travertine'
  | 'hgm'
  | 'tdm'
  | 'bm'
  | 'msm'
  | 'eb'
  | 'kpm'
  | 'fg'
  | 'cbm'
  | 'pp'
  | 'ms'
  | 'hgs'
  | 'hgf'
  | 'pm'
  | 'amf';

export type NameSource = 'printed' | 'normalized' | 'subcategory';

export interface SeriesDef {
  slug: SeriesSlug;
  family: FamilySlug;
  /** Display title for the series filter tier (from the taxonomy headers). */
  title: string;
}

/** 19 series, ordered per the taxonomy (and the §3.4 counts). */
export const SERIES: SeriesDef[] = [
  { slug: 'wg', family: 'wood-grain', title: 'Wood Grain' },
  { slug: 'imo', family: 'wood-grain', title: 'Italian Mixed Oil Finish' },
  { slug: 'pwv', family: 'wood-grain', title: 'Plant-bionic Veneer' },
  { slug: 'mm-matte-marble', family: 'stone-marble', title: 'Matte Marble' },
  { slug: 'mm-travertine', family: 'stone-marble', title: 'Travertine' },
  { slug: 'hgm', family: 'stone-marble', title: 'PET High Gloss Marble' },
  { slug: 'tdm', family: 'stone-marble', title: '3D PET High Gloss Marble' },
  { slug: 'bm', family: 'metal', title: 'Brushed Metal' },
  { slug: 'msm', family: 'metal', title: 'PET Matte Skin Touch Metal' },
  { slug: 'eb', family: 'metal', title: 'Liquid Metal' },
  { slug: 'kpm', family: 'metal', title: 'Korean PET Metal' },
  { slug: 'fg', family: 'textile', title: 'Fabric Grain' },
  { slug: 'cbm', family: 'textile', title: 'Cross Cloth (Marsha Cloth Pattern)' },
  { slug: 'pp', family: 'textile', title: 'PP Fabric Grain' },
  { slug: 'ms', family: 'solid', title: 'Matte Skin Sensory' },
  { slug: 'hgs', family: 'solid', title: 'High Gloss Solid Color' },
  { slug: 'hgf', family: 'solid', title: 'High Gloss Flash Point' },
  { slug: 'pm', family: 'glossy-decorative', title: 'PET Mirror and Water Ripple' },
  { slug: 'amf', family: 'glossy-decorative', title: 'PET Art Metal Film' },
];

/** Lookup helpers used by the generator. */
export const seriesBySlug = new Map(SERIES.map((s) => [s.slug, s]));
export const familyOf = (series: SeriesSlug): FamilySlug =>
  seriesBySlug.get(series)!.family;

/* ------------------------------------------------------------------------- */

export interface CatalogueProduct {
  code: string;
  series: SeriesSlug;
  subcategory: string;
  name: string;
  nameSource: NameSource;
}

/** Zero-padded numeric range, e.g. rng('WG', 1, 10, 2) → WG-01…WG-10. */
const rng = (prefix: string, from: number, to: number, width = 3): string[] =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}-${String(from + i).padStart(width, '0')}`);

/** Letter-suffixed pair, e.g. ab('HGM', 276) → HGM-276A, HGM-276B. */
const ab = (prefix: string, num: number): string[] => [`${prefix}-${num}A`, `${prefix}-${num}B`];

const one = (code: string): string[] => [code];

interface RowOpts {
  /** Constant name for every code (defaults to the subcategory label). */
  name?: string;
  /** Per-code names, order-matched with `codes`. */
  names?: string[];
  nameSource?: NameSource;
}

const row = (series: SeriesSlug, subcategory: string, codes: string[], opts: RowOpts = {}): CatalogueProduct[] => {
  const nameSource = opts.nameSource ?? 'printed';
  if (opts.names) {
    if (opts.names.length !== codes.length) {
      throw new Error(`row('${series}', '${subcategory}'): ${opts.names.length} names for ${codes.length} codes`);
    }
    return codes.map((code, i) => ({ code, series, subcategory, name: opts.names![i], nameSource }));
  }
  return codes.map((code) => ({ code, series, subcategory, name: opts.name ?? subcategory, nameSource }));
};

/* ------------------------------------------------------------------------- */
/* WOOD — 63 (wg 43 · imo 12 · pwv 8)                                        */
/* ------------------------------------------------------------------------- */

const ROWS: CatalogueProduct[][] = [
  // Series WG — Wood Grain (43). Index gaps: WG-37, WG-43–47 do not exist.
  row('wg', 'Classic Technology Wood', rng('WG', 1, 10, 2)),
  row('wg', 'Pear Wood', rng('WG', 11, 14, 2)),
  row('wg', 'Autumn Fragrance', rng('WG', 15, 18, 2)),
  row('wg', 'Orange Osmanthus', rng('WG', 19, 21, 2)),
  row('wg', 'White Oak', one('WG-22')),
  row('wg', 'Russian Oak', rng('WG', 23, 28, 2)),
  row('wg', 'Eucalyptus Radiata', rng('WG', 29, 34, 2)),
  row('wg', 'Nordic Technology Wood', rng('WG', 35, 36, 2)),
  row('wg', 'Stockholm Oak', rng('WG', 38, 39, 2)),
  row('wg', 'European Brown Oak (light)', one('WG-40')),
  row('wg', 'North American Black Walnut', one('WG-41')),
  row('wg', 'California Walnut', one('WG-42')),
  row('wg', 'Quanji Bamboo Joint', one('WG-48')),
  row('wg', 'Egger Oak', one('WG-49')),

  // Series IMO — Italian Mixed Oil Finish (12 singletons).
  row('imo', 'Troncy Oak', one('IMO-151')),
  row('imo', 'Sicilian Oak', one('IMO-152')),
  row('imo', 'Grey Oak', one('IMO-153')),
  row('imo', 'Ontario Walnut Wood', one('IMO-154')),
  row('imo', 'Ohio Walnut', one('IMO-155')),
  row('imo', 'California Black Walnut', one('IMO-156')),
  row('imo', 'Flowing Oak', one('IMO-157')),
  row('imo', 'Smoked Oak', one('IMO-158')),
  row('imo', 'Baker Oak', one('IMO-159')),
  row('imo', 'Berlin Oak', one('IMO-160')),
  row('imo', 'Rock Oak', one('IMO-161')),
  row('imo', 'American Oak', one('IMO-162')),

  // Series PWV — Plant-bionic Veneer (8 singletons).
  row('pwv', 'Half Fir Yellow Oak', one('PWV-163')),
  row('pwv', 'Half Cedar Chestnut Oak', one('PWV-164')),
  row('pwv', 'Smoked Black Oak', one('PWV-165')),
  row('pwv', 'Half Fir Brown Oak', one('PWV-166')),
  row('pwv', 'Smoked Brown Oak', one('PWV-167')),
  row('pwv', 'Senna Walnut', one('PWV-168')),
  row('pwv', 'Gorgeous Walnut', one('PWV-169')),
  row('pwv', 'Charcoal Burning Wood', one('PWV-170')),

  /* STONE & MARBLE — 50 (mm-matte-marble 14 · mm-travertine 5 · hgm 18 · tdm 13) */

  // Series MM (131–144) — Matte Marble (14 singletons; MM-145 not in index).
  row('mm-matte-marble', 'Fish Maw White Rock', one('MM-131')),
  row('mm-matte-marble', 'Lauren Platinum', one('MM-132')),
  row('mm-matte-marble', 'Korean Style Diatomaceous Earth Mud', one('MM-133')),
  row('mm-matte-marble', 'Florentine Limestone', one('MM-134')),
  row('mm-matte-marble', 'Corsican Grey', one('MM-135')),
  row('mm-matte-marble', 'Persian Limestone', one('MM-136')),
  row('mm-matte-marble', 'Black Lightning Pattern', one('MM-137')),
  row('mm-matte-marble', 'Aisi Limestone', one('MM-138')),
  row('mm-matte-marble', 'Starry Sky Grey', one('MM-139')),
  row('mm-matte-marble', 'Gravel Pattern', one('MM-140')),
  row('mm-matte-marble', 'Terrazzo', one('MM-141')),
  row('mm-matte-marble', 'Qianshan Snow Silk', one('MM-142')),
  row('mm-matte-marble', 'Large Terrazzo', one('MM-143')),
  row('mm-matte-marble', 'Impara Black (Matte)', one('MM-144')),

  // Series MM (146–150) — Travertine (5; descriptors + "Travertine").
  row('mm-travertine', 'Travertine', rng('MM', 146, 150), {
    names: ['Off-white Travertine', 'Beige Travertine', 'Light grey Travertine', 'Shanna Travertine', 'Italian red Travertine'],
  }),

  // Series HGM (271–285B) — PET High Gloss Marble (18). Gaps: 277, 284.
  row('hgm', 'Fish Maw White Slate', one('HGM-271')),
  row('hgm', 'Plato Slate', one('HGM-272')),
  row('hgm', 'Armani Limestone', one('HGM-273')),
  row('hgm', 'Florentine Limestone', one('HGM-274')),
  row('hgm', 'Korora Rock', one('HGM-275')),
  row('hgm', 'Pandora Slate', ab('HGM', 276)),
  row('hgm', 'Sevec White Slate', one('HGM-278')),
  row('hgm', 'Beverly Gold Slate', one('HGM-279')),
  row('hgm', 'The Wizard of Oz Slate', one('HGM-280')),
  row('hgm', 'Rococo Slate', ab('HGM', 281)),
  row('hgm', 'Boloni Slate', ab('HGM', 282)),
  row('hgm', 'Athena Slate', ab('HGM', 283)),
  row('hgm', 'Kanas Slate', ab('HGM', 285)),

  // Series TDM (301–316) — 3D PET High Gloss Marble (13 singletons;
  // "(Integrated)" stripped, normalized). Gaps: 310, 314, 315.
  row('tdm', 'Italian Fish Maw White', one('TDM-301'), { nameSource: 'normalized' }),
  row('tdm', 'Italian Fish Maw Gold', one('TDM-302'), { nameSource: 'normalized' }),
  row('tdm', 'Panda White', one('TDM-303'), { nameSource: 'normalized' }),
  row('tdm', 'Pandora Slate', one('TDM-304'), { nameSource: 'normalized' }),
  row('tdm', 'Amazon Blue Slate', one('TDM-305'), { nameSource: 'normalized' }),
  row('tdm', 'Florence Slate', one('TDM-306'), { nameSource: 'normalized' }),
  row('tdm', 'Yunshui Yao Slate', one('TDM-307'), { nameSource: 'normalized' }),
  row('tdm', 'Blue Firmament Slate', one('TDM-308'), { nameSource: 'normalized' }),
  row('tdm', 'Alpine White', one('TDM-309'), { nameSource: 'normalized' }),
  row('tdm', 'Louiskin', one('TDM-311'), { nameSource: 'normalized' }),
  row('tdm', 'Kasbeckite', one('TDM-312'), { nameSource: 'normalized' }),
  row('tdm', 'Sky Blue', one('TDM-313'), { nameSource: 'normalized' }),
  row('tdm', 'Qinyuan Spring', one('TDM-316'), { nameSource: 'normalized' }),

  /* METAL — 28 (bm 6 · msm 6 · eb 10 · kpm 6) */

  // Series BM — Brushed Metal (6).
  row('bm', 'Wiredrawing', rng('BM', 201, 205), {
    names: ['Golden Wiredrawing', 'Silver Wiredrawing', 'Champagne Wiredrawing', 'Copper Wiredrawing', 'Silver White Wiredrawing'],
  }),
  row('bm', 'Brown Brushed', one('BM-206')),

  // Series MSM — PET Matte Skin Touch Metal (6 singletons; codes from index).
  row('msm', 'Matte Silver', one('MSM-211')),
  row('msm', 'Matte Grey', one('MSM-212')),
  row('msm', 'Matte Champagne', one('MSM-213')),
  row('msm', 'Matte Tungsten Gold', one('MSM-214')),
  row('msm', 'Matte Ti-Gold', one('MSM-215')),
  row('msm', 'Matte Gold', one('MSM-216')),

  // Series EB — Liquid Metal (10 singletons).
  row('eb', 'Moonlight White', one('EB-221')),
  row('eb', 'Elegant Silver', one('EB-222')),
  row('eb', 'Meridian Grey', one('EB-223')),
  row('eb', 'Emerald', one('EB-224')),
  row('eb', 'Roman Red', one('EB-225')),
  row('eb', 'Tungsten Copper Gold', one('EB-226')),
  row('eb', 'Titanium Gray Silver', one('EB-227')),
  row('eb', 'Tixiang Gold', one('EB-228')),
  row('eb', 'Jade Sand Deep Gray', one('EB-229')),
  row('eb', 'Yusha Tungsten Copper Gold', one('EB-230')),

  // Series KPM — Korean PET Metal (6).
  row('kpm', 'Clustered Pattern', rng('KPM', 231, 232), {
    names: ['Silver Clustered Pattern', 'Gold Clustered Pattern'],
  }),
  row('kpm', 'Wiredrawing', rng('KPM', 233, 235), {
    names: ['Stainless Steel Wiredrawing', 'Rose Gold Wiredrawing', 'Champagne Wiredrawing'],
  }),
  row('kpm', 'Bright Silver (Horizontal Drawing)', one('KPM-236')),

  /* TEXTILE — 47 (fg 30 · cbm 10 · pp 7) */

  // Series FG — Fabric Grain (30).
  row('fg', 'Japanese Fabric', rng('FG', 61, 63, 2)),
  row('fg', 'Korean Fabric', rng('FG', 64, 66, 2)),
  row('fg', 'England Fabric', rng('FG', 67, 68, 2)),
  row('fg', 'Golden Thread Fabric', rng('FG', 69, 72, 2)),
  row('fg', 'Morandi', rng('FG', 73, 75, 2), {
    names: ['Morandi Heart of Admiration', 'Morandi Lotus Pond Moonlight', 'Morandi Summer Garden'],
  }),
  row('fg', 'Satin', rng('FG', 76, 77, 2), {
    names: ['Angel White Satin', 'Light Linen Satin'],
  }),
  row('fg', 'Simple Grid Pattern', one('FG-78')),
  row('fg', 'Silk Fabric Pattern', rng('FG', 79, 81, 2)),
  row('fg', 'Maca Pattern', rng('FG', 82, 83, 2)),
  row('fg', 'Silk Barathes', rng('FG', 84, 85, 2)),
  row('fg', 'Late Autumn', one('FG-86')),
  row('fg', 'Afternoon Sunshine', one('FG-87')),
  row('fg', 'Floating Light Cloth', one('FG-88')),
  row('fg', 'Love Silk Cloth', one('FG-89')),
  row('fg', 'Crane Dance With White Sand', one('FG-90')),

  // Series CBM — Cross Cloth (Marsha Cloth Pattern) (10, identical name).
  row('cbm', 'Marsha Fabric Membrane', rng('CBM', 171, 180)),

  // Series PP — PP Fabric Grain (7; "-PP" suffix stripped, normalized).
  row('pp', 'Prague', ['PP-191', 'PP-192', 'PP-196'], {
    names: ['Prague Warm White', 'Prague Deep Blue', 'Prague Moonlight Grey'],
    nameSource: 'normalized',
  }),
  row('pp', 'Brocade Pearl', ['PP-193', 'PP-194'], {
    names: ['Brocade Pearl White', 'Brocade Pearl Grey'],
    nameSource: 'normalized',
  }),
  row('pp', 'Mood For Love', one('PP-195'), { nameSource: 'normalized' }),
  row('pp', 'Weaving Swallow Feather Grey', one('PP-197'), { nameSource: 'normalized' }),

  /* SOLID — 33 (ms 24 · hgs 5 · hgf 4) */

  // Series MS — Matte Skin Sensory (24).
  row('ms', 'Skin White', one('MS-101')),
  row('ms', 'Hermes Orange', one('MS-102')),
  row('ms', 'Gentleman Grey', one('MS-103')),
  row('ms', 'Iron Grey', one('MS-104')),
  row('ms', 'Jade Gray', one('MS-105')),
  row('ms', 'Carmine Red', one('MS-106')),
  row('ms', 'Lichi Leather', ['MS-107', 'MS-108', 'MS-109'], {
    names: ['Grey Leather', 'Black Wood Khaki', 'Angel White'],
    nameSource: 'normalized',
  }),
  row('ms', 'Skin Sensory', rng('MS', 110, 124), {
    names: [
      'Skin Sensory Black',
      'Skin Sensory Light Coffee',
      'Skin Sensory Lunar Ash',
      'Skin Sensory Khaki Leather',
      'Skin Sensory Starry Twilight',
      'Skin Sensory Nile Grey',
      'Skin Sensory Ice Blue',
      'Skin Sensory Tropical Orange',
      'Skin Sensory Angel White',
      'Skin Sensory Oxford Grey',
      'Skin Sensory Scholar Grey',
      'Skin Sensory Khaki (dark)',
      'Skin Sensory Secret Realm Grey',
      'Skin Sensory Arctic Grey',
      'Skin Sensory Starry Cloud',
    ],
  }),

  // Series HGS — High Gloss Solid Color (5 singletons).
  row('hgs', 'Pearl White', one('HGS-237')),
  row('hgs', 'Jade Gray', one('HGS-238')),
  row('hgs', 'Ice Pot Autumn Moon', one('HGS-239')),
  row('hgs', 'Sky Grey', one('HGS-240')),
  row('hgs', 'Magic Black', one('HGS-241')),

  // Series HGF — High Gloss Flash Point (4; descriptors + "Flash Point").
  row('hgf', 'Flash Point', ['HGF-245', 'HGF-246', 'HGF-248', 'HGF-249'], {
    names: ['Pearl Flash Point', 'Champagne Flash Point', 'Blue Treasure Flash Point', 'Obsidian Flash Point'],
  }),

  /* DECORATIVE & MIRROR — 37 (pm 17 · amf 20) */

  // Series PM — PET Mirror and Water Ripple (17).
  row('pm', 'Mirror', ['PM-251', 'PM-252', 'PM-253', 'PM-255', 'PM-256', 'PM-257', 'PM-258', 'PM-259'], {
    names: ['Silver Mirror', 'Polygram Mirror', 'Space Gray Mirror', 'Black Mirror', 'Colorful Mirror No.1', 'Colorful Mirror No.2', 'Colorful Mirror No.3', 'Colorful Mirror No.4'],
  }),
  row('pm', 'Gradient', rng('PM', 260, 262), {
    names: ['Blue White Gradient', 'Red White Gradient', 'Yellow White Gradient'],
  }),
  row('pm', 'Water Ripple', ['PM-263', 'PM-264', 'PM-265', 'PM-266', 'PM-268'], {
    names: ['Silver Water Ripple', 'Gold Water Ripple', 'Champagne Water Ripple', 'Blue Water Ripple', 'Light Gold Water Ripple'],
  }),
  row('pm', 'Silver Mosaic', one('PM-269')),

  // Series AMF — PET Art Metal Film (20; subcategory + " - " + finish).
  row('amf', 'Triumphal Gate', ['AMF-321', 'AMF-322', 'AMF-324'], {
    names: ['Triumphal Gate - Silver', 'Triumphal Gate - Grey', 'Triumphal Gate - Normanie Red'],
  }),
  // AMF-323 prints "Triumphal Arch" (typo) — normalized to "Gate".
  row('amf', 'Triumphal Gate', one('AMF-323'), {
    name: 'Triumphal Gate - Bronze',
    nameSource: 'normalized',
  }),
  // Case + spelling normalized to "Small Cylinder" across the four.
  row('amf', 'Small Cylinder', rng('AMF', 325, 328), {
    names: ['Small Cylinder - Silver', 'Small Cylinder - Grey', 'Small Cylinder - Bronze', 'Small Cylinder - Normanie Red'],
    nameSource: 'normalized',
  }),
  row('amf', 'Natural Wood', rng('AMF', 329, 332), {
    names: ['Natural Wood - Silver', 'Natural Wood - Grey', 'Natural Wood - Bronze', 'Natural Wood - Normanie Red'],
  }),
  row('amf', 'Grid Pattern', rng('AMF', 333, 336), {
    names: ['Grid Pattern - Silver', 'Grid Pattern - Grey', 'Grid Pattern - Bronze', 'Grid Pattern - Normanie Red'],
  }),
  row('amf', 'Pit', rng('AMF', 337, 340), {
    names: ['Pit - Silver', 'Pit - Grey', 'Pit - Bronze', 'Pit - Normanie Red'],
  }),
];

/** All 258 codes, flattened in canonical (family → series → code) order. */
export const CATALOGUE: CatalogueProduct[] = ROWS.flat();
