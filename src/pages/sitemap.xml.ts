// Sitemap — generated at build time from the content collections (PRD M5,
// regenerated for the R5 route set). Indexable routes only: the homepage,
// the catalogue, and every family + series filter page — 27 URLs total
// (1 + 1 + 6 + 19). The transactional/dev pages (/request, /thank-you,
// /style-guide) carry noindex meta and are deliberately excluded — a lead
// form, its confirmation, and an internal reference page have no place in
// SERPs. The retired /collections/[slug] URLs are 301s (PRD R5) and are
// never listed here. Absolute URLs are built from SITE_URL (src/site.ts);
// swap that value for the production domain at M8 and update
// public/robots.txt to match.
//
// The family/series derivation mirrors the catalogue template's
// getStaticPaths exactly (src/pages/products/[...filters]/index.astro):
// family paths come from the collections collection, series paths from the
// SERIES taxonomy table (data/catalogue-master.ts), joined on the family
// slug — so the sitemap can never drift from the routes it describes.
import { getCollection } from 'astro:content';
import { SERIES } from '../../data/catalogue-master';
import { SITE_URL } from '../site';

export async function GET() {
  const collections = (await getCollection('collections')).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const paths = ['/', '/products'];
  for (const c of collections) {
    paths.push(`/products/${c.data.slug}`);
    for (const s of SERIES) {
      if (s.family === c.data.slug) {
        paths.push(`/products/${c.data.slug}/${s.slug}`);
      }
    }
  }
  const urls = paths
    .map((p) => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml' } });
}
