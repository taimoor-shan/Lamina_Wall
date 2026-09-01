// Build-time Google Fonts CSS — M5 perf.
//
// The css2 stylesheet was the one external request on the first-paint path
// (~460ms observed from a dev machine; ~300ms charged on simulated mobile).
// Fetching it at build time and inlining the @font-face rules removes that
// round trip entirely; the woff2 files still load from fonts.gstatic.com at
// runtime (PRD §2: fonts come from Google Fonts, no local font files).
//
// Falls back to the async media-swap <link> when the build machine is
// offline — every page renders fine either way.

export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap';

let cached: string | null | undefined;

/** The css2 stylesheet text, or null when the build-time fetch failed. */
export async function fontCss(): Promise<string | null> {
  if (cached !== undefined) return cached;
  cached = null;
  try {
    // css2 keys on the User-Agent; a Chrome UA is what returns woff2 rules.
    const res = await fetch(FONT_CSS_URL, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) cached = await res.text();
  } catch {
    /* offline build — pages keep the async <link> */
  }
  return cached;
}
