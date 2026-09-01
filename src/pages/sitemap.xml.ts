// Sitemap — generated at build time from the content collections (PRD M5).
// Content routes only: the homepage plus the six collection pages. The
// transactional/dev pages (/request, /thank-you, /style-guide) carry
// noindex meta and are deliberately excluded — a lead form, its
// confirmation, and an internal reference page have no place in SERPs.
// Absolute URLs are built from SITE_URL (src/site.ts); swap that value
// for the production domain at M8 and update public/robots.txt to match.
import { getCollection } from 'astro:content';
import { SITE_URL } from '../site';

export async function GET() {
  const collections = await getCollection('collections');
  const paths = ['/', ...collections.map((c) => `/collections/${c.data.slug}`)];
  const urls = paths
    .map((p) => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml' } });
}
