import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* Content schemas from PRD §3.2.
   Astro 7 note: build-time content collections are defined with a `loader`
   (Astro's content layer), not the historical `type: 'data'` flag. A product
   pointing at a nonexistent collection slug fails the build (reference())
   instead of silently producing an orphaned entry. Collections stay
   data-driven — a fifth collection later requires only a new JSON file,
   never a schema edit. */

const product = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      // "WG-01" — canonical identifier; shared verbatim (lowercased) with the
      // JSON filename and image filename (PRD §3.3).
      code: z.string(),
      name: z.string(),
      // Validated at build time against real entries in the collections
      // collection — an unknown slug fails the build.
      collection: reference('collections'),
      // Phase 2 (PRD §3.4): series slug (e.g. "wg", "mm-travertine") and the
      // taxonomy subcategory label the code belongs to. Emitted by
      // scripts/generate-catalogue.mjs — never hand-edited en masse.
      series: z.string(),
      subcategory: z.string(),
      // "real" = real swatch photography; "placeholder" = shared IMAGE MISSING
      // tile until real photography arrives (backfill = swap ref + set real).
      imageStatus: z.enum(['real', 'placeholder']).default('real'),
      swatchImage: image(),
      description: z.string().optional(),
      // Alt text is required for every product image (PRD §3.3) — plain
      // description of the material, not marketing copy.
      alt: z.string(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      // Controls ordering within a collection filmstrip.
      order: z.number().default(0),
    }),
});

const collection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/collections' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      title: z.string(),
      tagline: z.string(),
      description: z.string(),
      heroApplicationImage: image(),
      // Alt text for the hero application image (PRD §3.3).
      heroAlt: z.string(),
      // Second application photo, shown beside the hero image in the
      // collection section's 8/4 grid (AppShowcase.astro).
      secondaryApplicationImage: image(),
      secondaryApplicationAlt: z.string(),
      // Controls index-strip ordering.
      order: z.number(),
    }),
});

export const collections = { products: product, collections: collection };