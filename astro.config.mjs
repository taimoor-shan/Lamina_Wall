// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  // Static-by-default (Astro 7: `output: 'static'` is the default and replaces
  // the former 'hybrid' mode). Image-heavy marketing pages pre-render as Worker
  // static assets; routes opt in to on-demand execution with
  // `export const prerender = false` or non-GET handlers (the request form).
  adapter: cloudflare({
    // PRD §3.3/M2 requires build-time WebP/AVIF + responsive srcset generation.
    // The adapter's default 'cloudflare-binding' service transforms at runtime instead;
    // 'compile' keeps generation at build time (verified locally in `astro build`).
    imageService: 'compile',
  }),
  // All CSS is tiny (a few KiB per page); inlining removes every
  // render-blocking stylesheet request — one HTML request to first paint.
  build: { inlineStylesheets: 'always' },
  // M4: the request tray is the single interactive island, mounted
  // client:load only on pages that carry swatches (homepage + collection
  // pages). The /request page stays plain HTML with a small inline script.
  integrations: [svelte()],
});