// R3: build-time constant injected by astro.config.mjs (vite.define) — true
// only when public/catalogue.pdf exists when the build starts. Gates the
// landing page's catalogue-PDF download CTA (both the hero's secondary
// action and the closing statement's CTA row). Never a runtime value.
declare const __R3_CATALOGUE_PDF__: boolean;

// Typings for the LAMINA worker's runtime bindings (PRD §2.2).
//
// `cloudflare:workers` is a Cloudflare-provided virtual module; without
// generated types (the adapter's `wrangler types` — no root wrangler config
// exists yet; dist/server/wrangler.json is generated at build), declare the
// exact binding set the code reads. If the project later adds a root
// wrangler config, `wrangler types` output supersedes this file.
declare module 'cloudflare:workers' {
  export interface Env {
    /** Server-side Turnstile verify secret — `wrangler secret put` (never PUBLIC_). */
    TURNSTILE_SECRET_KEY: string;
    /** Resend API key — `wrangler secret put`. */
    RESEND_API_KEY: string;
    /** Optional from/to overrides for the recap email. */
    RESEND_FROM?: string;
    RESEND_TO?: string;
  }
  export const env: Env;
}
