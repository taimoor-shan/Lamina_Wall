// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

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
});