
# Subcategory Taxonomy — Reference

Extracted directly from the catalogue's own INDEX pages (the "Name" column repeated across contiguous codes). This is the source of truth for the `subcategory` field on every product — see `LAMINA-PRD.md` §3.4 for the schema.

## How to read this table

Every subcategory grouping below is labeled with how confident it is:

- **[literal]** — the manufacturer printed the exact same name string for 2+ codes in a row. This is a directly observed fact from the index, not an interpretation.
- **[inferred]** — the codes share a repeated word/prefix/suffix (e.g. every name ends in "Travertine," or contains the same parenthetical tag), but the full strings aren't identical. Grouping these is a reasonable reading, not a certainty — flagged so a human can override it.
- **[singleton]** — no other code shares this name or an obvious pattern with it. It gets its own subcategory of one, not force-merged into a neighbor.

Two print inconsistencies in the source are preserved as printed, not silently corrected: **AMF-323** is labeled "Triumphal **Arch** - Bronze" while its three siblings (321/322/324) say "Triumphal **Gate**" — almost certainly a manufacturer typo, but reproduced faithfully rather than assumed. Capitalization of "cylinder" vs. "Cylinder" (AMF-325-328) is similarly inconsistent in the source and left as-is.

Several names repeat **across different series** with different codes (e.g. "California Walnut" WG-42 vs. "California Black Walnut" IMO-156; "Florentine Limestone" MM-134 vs. "Florentine limestone" HGM-274; "Pandora Slate" HGM-276A/B vs. "Pandora Slate" TDM-304). These are **not** the same subcategory — subcategory scope is always within one series, never across series, even when the printed name is identical.

---

## Wood (`wood-grain` collection)

### Series: WG — Wood Grain
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Classic Technology Wood | WG-01–10 | 10 | literal |
| Pear Wood | WG-11–14 | 4 | literal |
| Autumn Fragrance | WG-15–18 | 4 | literal |
| Orange Osmanthus | WG-19–21 | 3 | literal |
| White Oak | WG-22 | 1 | singleton |
| Russian Oak | WG-23–28 | 6 | literal |
| Eucalyptus Radiata | WG-29–34 | 6 | literal |
| Nordic Technology Wood | WG-35–36 | 2 | literal |
| Stockholm Oak | WG-38–39 | 2 | literal |
| European Brown Oak (light) | WG-40 | 1 | singleton |
| North American Black Walnut | WG-41 | 1 | singleton |
| California Walnut | WG-42 | 1 | singleton |
| Quanji Bamboo Joint | WG-48 | 1 | singleton |
| Egger Oak | WG-49 | 1 | singleton |

Note: WG-37 and WG-43–47 are absent from the index — gaps in the manufacturer's own numbering, not a transcription error on this end.

### Series: IMO — Italian Mixed Oil Finish
No repeated names in this series — every code is its own subcategory:
Troncy Oak (151), Sicilian Oak (152), Grey Oak (153), Ontario Walnut Wood (154), Ohio Walnut (155), California Black Walnut (156), Flowing Oak (157), Smoked Oak (158), Baker Oak (159), Berlin Oak (160), Rock Oak (161), American Oak (162). **12 singletons.**

### Series: PWV — Plant-bionic Veneer
No repeated names — every code is its own subcategory:
Half Fir Yellow Oak (163), Half Cedar Chestnut Oak (164), Smoked Black Oak (165), Half Fir Brown Oak (166), Smoked Brown Oak (167), Senna Walnut (168), Gorgeous Walnut (169), Charcoal Burning Wood (170). **8 singletons.**

**Wood total: 43 + 12 + 8 = 63 codes across 14 + 12 + 8 = 34 subcategories.**

---

## Stone & Marble (`stone-marble` collection)

### Series: MM (131–144) — Matte Marble
No repeated names — every code is its own subcategory:
Fish Maw White Rock (131), Lauren Platinum (132), Korean Style Diatomaceous Earth Mud (133), Florentine Limestone (134), Corsican Grey (135), Persian Limestone (136), Black Lightning Pattern (137), Aisi Limestone (138), Starry Sky Grey (139), Gravel Pattern (140), Terrazzo (141), Qianshan Snow Silk (142), Large Terrazzo (143), Impara Black (Matte) (144). **14 singletons.**

### Series: MM (146–150) — Travertine
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Travertine | MM-146–150 | 5 | **inferred** — every name is "`<descriptor>` Travertine" (Off-white, Beige, Light grey, Shanna, Italian red); grouping the shared suffix, not a literal repeat. |

### Series: HGM (271–285B) — PET High Gloss Marble
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Pandora Slate | HGM-276A, 276B | 2 | literal |
| Rococo Slate | HGM-281A, 281B | 2 | literal |
| Boloni Slate | HGM-282A, 282B | 2 | literal |
| Athena Slate | HGM-283A, 283B | 2 | literal |
| Kanas Slate | HGM-285A, 285B | 2 | literal |
| Fish Maw White Slate | HGM-271 | 1 | singleton |
| Plato Slate | HGM-272 | 1 | singleton |
| Armani Limestone | HGM-273 | 1 | singleton |
| Florentine Limestone | HGM-274 | 1 | singleton (name collision with MM-134 — different series, not the same subcategory) |
| Korora Rock | HGM-275 | 1 | singleton |
| Sevec White Slate | HGM-278 | 1 | singleton |
| Beverly Gold Slate | HGM-279 | 1 | singleton |
| The Wizard of Oz Slate | HGM-280 | 1 | singleton |

### Series: TDM (301–316) — 3D PET High Gloss Marble
No repeated names — every code is its own subcategory:
Italian Fish Maw White (301), Italian Fish Maw Gold (302), Panda White (303), Pandora Slate (304, name collision with HGM-276A/B — different series), Amazon Blue Slate (305), Florence Slate (306), Yunshui Yao Slate (307), Blue Firmament Slate (308), Alpine White (309), Louiskin (311), Kasbeckite (312), Sky Blue (313), Qinyuan Spring (316). **13 singletons.**

**Stone & Marble total: 14 + 5 + 18 + 13 = 50 codes.**

---

## Metal (`metal` collection)

### Series: BM — Brushed Metal
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Wiredrawing | BM-201–205 (Golden, Silver, Champagne, Copper, Silver White) | 5 | **inferred** — shared word "Wiredrawing," not identical strings. |
| Brown Brushed | BM-206 | 1 | singleton |

### Series: MSM — PET Matte Skin Touch Metal
Every name begins with "Matte" (Matte Silver, Matte Grey, Matte Champagne, Matte Tungsten Gold, Matte Ti-Gold, Matte Gold) — **not treated as a subcategory grouping**, since "Matte" here just restates the series itself rather than distinguishing anything within it. Left as **6 singletons** — flag if you'd rather group them anyway.

### Series: EB — Liquid Metal
No repeated names — every code is its own subcategory:
Moonlight White (221), Elegant Silver (222), Meridian Grey (223), Emerald (224), Roman Red (225), Tungsten Copper Gold (226), Titanium Gray Silver (227), Tixiang Gold (228), Jade Sand Deep Gray (229), Yusha Tungsten Copper Gold (230). **10 singletons.**

### Series: KPM — Korean PET Metal
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Clustered Pattern | KPM-231, 232 (Silver, Gold) | 2 | inferred |
| Wiredrawing | KPM-233, 234, 235 (Stainless Steel, Rose Gold, Champagne) | 3 | inferred |
| Bright Silver (Horizontal Drawing) | KPM-236 | 1 | singleton |

**Metal total: 6 + 6 + 10 + 6 = 28 codes.**

---

## Textile (`textile` collection)

### Series: FG — Fabric Grain
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Japanese Fabric | FG-61–63 | 3 | literal |
| Korean Fabric | FG-64–66 | 3 | literal |
| England Fabric | FG-67–68 | 2 | literal |
| Golden Thread Fabric | FG-69–72 | 4 | literal |
| Silk Fabric Pattern | FG-79–81 | 3 | literal |
| Maca Pattern | FG-82–83 | 2 | literal |
| Silk Barathes | FG-84–85 | 2 | literal |
| Morandi | FG-73–75 (Heart of Admiration, Lotus Pond Moonlight, Summer Garden) | 3 | inferred — shared prefix "Morandi," each with a distinct second half. |
| Satin | FG-76–77 (Angel White Satin, Light Linen Satin) | 2 | inferred — shared suffix. |
| Simple Grid Pattern | FG-78 | 1 | singleton |
| Late Autumn | FG-86 | 1 | singleton |
| Afternoon Sunshine | FG-87 | 1 | singleton |
| Floating Light Cloth | FG-88 | 1 | singleton |
| Love Silk Cloth | FG-89 | 1 | singleton |
| Crane Dance With White Sand | FG-90 | 1 | singleton |

### Series: CBM — Cross Cloth (Marsha Cloth Pattern)
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Marsha Fabric Membrane | CBM-171–180 | 10 | literal — all ten codes share the identical name. |

### Series: PP — PP Fabric Grain
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Prague | PP-191, 192, 196 (Warm White, Deep Blue, Moonlight Grey) | 3 | inferred |
| Brocade Pearl | PP-193, 194 (White, Grey) | 2 | inferred |
| Mood For Love | PP-195 | 1 | singleton |
| Weaving Swallow Feather Grey | PP-197 | 1 | singleton |

**Textile total: 30 + 10 + 7 = 47 codes.**

---

## Solid Color (`solid` collection)

### Series: MS — Matte Skin Sensory
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Skin Sensory | MS-110–124 | 15 | **inferred** — every one of these 15 names literally starts with "Skin Sensory," e.g. "Skin Sensory Black," "Skin Sensory Light Coffee." Strong, consistent pattern; still not an identical-string repeat, so marked inferred rather than literal. |
| Lichi Leather | MS-107–109 (Grey Leather, Black Wood Khaki, Angel White) | 3 | inferred — all three carry the literal parenthetical "(Lichi Leather)." |
| Skin White / Hermes Orange / Gentleman Grey / Iron Grey / Jade Gray / Carmine Red | MS-101–106 | 6 | **singletons** — these six share no common word at all; resist the temptation to lump them under "Matte Skin," that label doesn't appear anywhere in the source. |

### Series: HGS — High Gloss Solid Color
No repeated names — every code is its own subcategory:
Pearl White (237), Jade Gray (238), Ice Pot Autumn Moon (239), Sky Grey (240), Magic Black (241). **5 singletons.**

### Series: HGF — High Gloss Flash Point
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Flash Point | HGF-245, 246, 248, 249 (Pearl, Champagne, Blue Treasure, Obsidian) | 4 | inferred — shared suffix, 100% consistent across the whole series. |

**Solid Color total: 24 + 5 + 4 = 33 codes.**

---

## Decorative & Mirror (`glossy-decorative` collection)

### Series: PM — PET Mirror and Water Ripple
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Mirror | PM-251, 252, 253, 255, 256, 257, 258, 259 (Silver, Polygram, Space Gray, Black, Colorful No.1–4) | 8 | inferred — shared suffix "Mirror." "Colorful Mirror No.1–4" (256–259) is itself a literal repeat nested one level down, if you want that granularity. |
| Gradient | PM-260, 261, 262 (Blue white, Red white, Yellow white) | 3 | inferred |
| Water Ripple | PM-263, 264, 265, 266, 268 (Silver, Gold, Champagne, Blue, Light Gold) | 5 | inferred |
| Silver Mosaic | PM-269 | 1 | singleton |

### Series: AMF — PET Art Metal Film
| Subcategory | Codes | Count | Confidence |
|---|---|---|---|
| Triumphal Gate | AMF-321, 322, 323, 324 | 4 | **literal, with a printed inconsistency**: AMF-323 is labeled "Triumphal **Arch** - Bronze" in the source while 321/322/324 say "Triumphal **Gate**." Almost certainly a manufacturer typo — reproduced as printed, not corrected. Decide whether to silently normalize it to "Gate" in your data or keep it as printed; either is defensible, but make the call explicitly rather than let it happen by accident. |
| Small Cylinder | AMF-325, 326, 327, 328 | 4 | literal (source also inconsistently capitalizes "cylinder" vs. "Cylinder" across these four — cosmetic, safe to normalize) |
| Natural Wood | AMF-329, 330, 331, 332 | 4 | literal |
| Grid Pattern | AMF-333, 334, 335, 336 | 4 | literal |
| Pit | AMF-337, 338, 339, 340 | 4 | literal |

**Decorative & Mirror total: 17 + 20 = 37 codes.**

---

## Grand total

63 (Wood) + 50 (Stone & Marble) + 28 (Metal) + 47 (Textile) + 33 (Solid Color) + 37 (Decorative & Mirror) = **258 codes**, matching the count established earlier in this project.

## Implementation note

This table is the taxonomy. It is **not** a claim about which of these 258 codes currently exist as product files in the repo — cross-reference each existing product's `code` against this table to assign its `subcategory`. If a product's code isn't found here, that's a real discrepancy (wrong code, or a code this table missed) and needs a human look, not a guess.
