/**
 * LAMINA product story — the landing-page Features/Advantages/Substrates
 * content and the family-page spec block source (PRD Phase 3 S2 / S6).
 *
 * PROVENANCE: transcribed from the manufacturer catalogue PDF page 4
 * ("Advantages of PVC wall panels" / "PVC wall panel product features" /
 * "Types of PVC wall panels"). The PDF is image-only (no text layer), so
 * this is a hand transcription of the client-supplied copy — OCR noise and
 * scan artefacts are cleaned up, but NO content is invented or paraphrased.
 * Where the source is ambiguous, the most legible statement is kept and
 * nothing is padded.
 *
 * Structure:
 *   advantages — 4 core advantages
 *   features   — 8 numbered product features
 *   substrates — 3 substrate types with their spec rows
 *
 * NOTE (S6): the family-page spec block data lives in the collections JSONs
 * (the `specs` field, src/content/collections/*.json — §3.5), NOT here. This
 * file covers the landing-page sections only.
 */

export interface Advantage {
  n: string;
  title: string;
  body: string;
}

export interface Feature {
  n: string;
  title: string;
  body: string;
}

export interface SubstrateSpec {
  label: string;
  value: string;
}

export interface Substrate {
  title: string;
  intro: string;
  specs: SubstrateSpec[];
}

/* ------------------------------------------------------------------ */
/* 4 core advantages (catalogue PDF page 4, section 01)                */
/* ------------------------------------------------------------------ */

export const advantages: Advantage[] = [
  {
    n: '01',
    title: 'Ultra-high environmental performance',
    body: 'PVC wall panels have the characteristics of zero formaldehyde, no heavy metals and harmful substances, and meet the standard for vinyl chloride monomer volatilisation. It is a truly environmentally friendly wall decoration material.',
  },
  {
    n: '02',
    title: 'Quickly define and decorate your space',
    body: 'Compared with various wall materials on the market, the installation method of PVC wall panels is to use main materials (PVC wall panels + metal lines + silicone structural adhesive) and other materials for installation, which can quickly and comprehensively decorate a new space in a short time.',
  },
  {
    n: '03',
    title: 'Incredibly rich and colourful surface finishes',
    body: 'The surface can fit traditional PVC film — wood grain, cloth grain, skin sensory, matte marble grain and more — as well as high-gloss PET films, including PET single colour, PET flash film, PET high-gloss marble film, PET metal film and mirror film. It can also fit food-grade PP film, leather and other surface materials.',
  },
  {
    n: '04',
    title: 'Diversified installation methods',
    body: 'PVC wall panels can be installed directly on the wall without a base layer — using metal lines + PVC wall panels + structural adhesive, or by slotting the panels first to install for a simple, seamless effect.',
  },
];

/* ------------------------------------------------------------------ */
/* 8 numbered product features (catalogue PDF page 4, section 02)      */
/* ------------------------------------------------------------------ */

export const features: Feature[] = [
  {
    n: '01',
    title: 'Clear texture',
    body: 'PVC wall panels have the characteristics of fresh and clear texture.',
  },
  {
    n: '02',
    title: 'Health and environmental protection',
    body: 'PVC wall panel is a high-density PVC substrate bonded with imported PUR hot-melt adhesive, with the characteristic of zero formaldehyde emission.',
  },
  {
    n: '03',
    title: 'Balance and stability',
    body: 'Micro-foamed PVC wall panels (including carbon crystal panels and super-hard WPC panels) are a three-layer structure with excellent stability.',
  },
  {
    n: '04',
    title: 'Moisture and moth prevention',
    body: 'The main material composition of PVC wall panels is PVC resin powder, which has excellent waterproof performance and excellent anti-insect function.',
  },
  {
    n: '05',
    title: 'Diverse styles',
    body: 'PVC wall panels have the characteristics of various colours and free sizing, which can meet the decoration needs of various styles.',
  },
  {
    n: '06',
    title: 'Strong compression resistance',
    body: 'The PVC wall panel substrate has the characteristics of high strength, strong compressive strength and good buffering performance.',
  },
  {
    n: '07',
    title: 'Flexible installation methods',
    body: 'Panels can be installed using the exposed I-bar (T&G slot, T&G click, G&G click) method, the hidden I-bar (G&G click) method, or the T&G (lock buckle / flat buckle) method. With auxiliary materials such as stainless-steel clips and metal lines, a seamless effect can be achieved.',
  },
  {
    n: '08',
    title: 'Easy to manage',
    body: 'PVC wall panels have the characteristics of flame retardancy, burn resistance, scratch resistance and stain resistance, and are easy to clean and maintain.',
  },
];

/* ------------------------------------------------------------------ */
/* 3 substrate types (catalogue PDF page 4, section 03)                */
/* ------------------------------------------------------------------ */

export const substrates: Substrate[] = [
  {
    title: 'Carbon crystal board',
    intro:
      'A three-layer structure with white crystal ceramic layers on the front and back and a black core layer of bamboo carbon fibre in the middle. The plate is divided into two densities, 0.65 and 0.75, according to the surface bonding process. The 0.65 substrate suits all PVC films; the 0.75 substrate suits all PET/PP films and the U-groove wrapping of all PVC films.',
    specs: [
      { label: 'Density', value: '0.65 / 0.75' },
    ],
  },
  {
    title: 'Super-hard WPC panel',
    intro:
      'The base material is also a three-layer structure — white diamond layers 1.2mm thick on the front and back, with a white micro-foam core layer in the middle. It generally comes in 5mm and 8mm. Both thicknesses suit the flat pasting of all PVC/PET/PP films; the 8mm substrate also suits U-groove wrapping of PVC films.',
    specs: [
      { label: 'Thickness', value: '5 mm / 8 mm' },
      { label: 'Density', value: '1.0 (5mm) / 0.9 (8mm)' },
    ],
  },
  {
    title: 'SPC panel',
    intro:
      'Our SPC wall panel generally comes in three thicknesses — 3mm, 4mm and 5mm — with a density of 2.1, and suits the flat pasting of all PVC/PET/PP films. A UV roll-coating option is wear-resistant and stain resistant, widely used in spaces such as bathrooms and staircases, with good surface hardness, strong impact resistance, no peeling and no colour fading. 4mm/5mm panels can also be slotted and installed seamlessly.',
    specs: [
      { label: 'Thickness', value: '3 mm / 4 mm / 5 mm' },
      { label: 'Density', value: '2.1' },
    ],
  },
];
