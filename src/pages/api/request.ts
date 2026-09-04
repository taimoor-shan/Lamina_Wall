// M4 — sample-request submission endpoint (PRD §4).
//
// On-demand worker route (prerender = false): the /request form POSTs here
// either as form-encoded (native, works without JS — PRD §4.1 no-JS
// fallback) or as JSON (the page's fetch enhancement). The worker:
//   1. rejects cross-origin posts (Origin check)
//   2. validates every field (security boundary — client validation is UX)
//   3. rejects duplicate submission ids (in-memory, short TTL)
//   4. verifies the Turnstile token against Cloudflare
//   5. emails a readable recap to the studio inbox via Resend
//
// Language per PRD: samples / requests — never prices, never ecommerce.
//
// Secrets: TURNSTILE_SECRET_KEY + RESEND_API_KEY are worker bindings
// (`wrangler secret put` in production; .dev.vars locally). Neither ever
// leaves the server. PUBLIC_TURNSTILE_SITE_KEY is the only frontend key.
//
// Bindings come from the Cloudflare runtime (`import { env } from
// 'cloudflare:workers'`) — import.meta.env.X is statically replaced at
// build time and can't see runtime secrets.
//
// Note on the in-memory duplicate map: each worker isolate keeps its own
// Map, so the guard is per-isolate with a short TTL (PRD §4.1's "in-memory
// / short-TTL" level — it catches double-submits from one session, not a
// distributed flood; Turnstile is the bot boundary).
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { env } from 'cloudflare:workers';

export const prerender = false;

// The recap email shows the catalogue name per article. Names are resolved
// from the site's own content collection — client-supplied names are never
// trusted (the tray sends only codes + quantities). The map is built once
// per isolate and cached.
let nameMap: Map<string, string> | null = null;
async function collectNames(): Promise<Map<string, string>> {
  if (!nameMap) {
    const map = new Map<string, string>();
    for (const p of await getCollection('products')) {
      map.set(p.data.code, p.data.name);
    }
    nameMap = map;
  }
  return nameMap;
}

// Article-code grammar (PRD §3.3/§3.4). The optional trailing letter admits
// the catalogue's real letter-suffixed codes — HGM-276A/B, HGM-281A/B,
// HGM-282A/B, HGM-283A/B, HGM-285A/B (10 of the 258; R4: the M4-era regex
// predated them and rejected those codes with 400). Anything else — extra
// letters, lowercase JSON-path codes, made-up numbers — stays rejected
// ("Unknown article number"), so the boundary shape is unchanged.
const ITEM_CODE = /^[A-Z]{1,4}-\d{2,4}[A-Z]?$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SUB_ID = /^[A-Za-z0-9-]{8,64}$/;
const ITEM_LINE = /^([A-Z]{1,4}-\d{2,4}[A-Z]?)(?:\s*[×x*]\s*(\d{1,2}))?$/;

const MAX_ITEMS = 50;
const MAX_QTY = 99;

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_API = 'https://api.resend.com/emails';
const DUPLICATE_TTL_MS = 15 * 60 * 1000;

// submission ids seen recently — Map<id, receivedAt>
const seen: Map<string, number> = new Map();

interface Item {
  code: string;
  qty: number;
}

interface Payload {
  company: string;
  contact: string;
  email: string;
  phone?: string;
  project?: string;
  notes?: string;
  items: Item[];
  submissionId: string;
  turnstileToken: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function prune() {
  const now = Date.now();
  for (const [id, at] of seen) if (now - at > DUPLICATE_TTL_MS) seen.delete(id);
}

function remember(id: string): boolean {
  prune();
  if (seen.has(id)) return false;
  seen.set(id, Date.now());
  return true;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Parse the no-JS fallback field: one item per line, "CODE ×qty". */
function parseItemsText(raw: string): { ok: true; items: Item[] } | { ok: false; bad: string[] } {
  const items: Item[] = [];
  const bad: string[] = [];
  for (const line of raw.split(/[,;\n]+/)) {
    const t = line.trim();
    if (!t) continue;
    const m = ITEM_LINE.exec(t);
    if (!m) {
      bad.push(t);
      continue;
    }
    items.push({ code: m[1].toUpperCase(), qty: m[2] ? Math.min(MAX_QTY, Number(m[2])) : 1 });
  }
  if (bad.length) return { ok: false, bad };
  return { ok: true, items };
}

/** Security boundary — every field is validated here, not just in the UI. */
function validate(p: Payload): { ok: true } | { ok: false; message: string } {
  if (!p.company || p.company.length > 120) return { ok: false, message: 'Please provide a company name.' };
  if (!p.contact || p.contact.length > 120) return { ok: false, message: 'Please provide a contact name.' };
  if (!p.email || p.email.length > 254 || !EMAIL.test(p.email)) return { ok: false, message: 'Please provide a valid email address.' };
  if (p.phone && p.phone.length > 40) return { ok: false, message: 'Phone number is too long.' };
  if (p.project && p.project.length > 200) return { ok: false, message: 'Project name is too long.' };
  if (p.notes && p.notes.length > 2000) return { ok: false, message: 'Notes are too long.' };
  if (!p.submissionId || !SUB_ID.test(p.submissionId)) return { ok: false, message: 'Submission id missing or invalid.' };
  if (!p.turnstileToken || p.turnstileToken.length > 2048) return { ok: false, message: 'Security check incomplete — please complete the challenge and try again.' };
  if (p.items.length < 1) return { ok: false, message: 'Select at least one sample to request.' };
  if (p.items.length > MAX_ITEMS) return { ok: false, message: `Too many samples — max ${MAX_ITEMS} per request.` };
  const codes = new Set<string>();
  for (const it of p.items) {
    if (!ITEM_CODE.test(it.code)) return { ok: false, message: `Unknown article number: ${it.code}` };
    if (codes.has(it.code)) return { ok: false, message: `Duplicate article number: ${it.code}` };
    codes.add(it.code);
    if (!Number.isInteger(it.qty) || it.qty < 1 || it.qty > MAX_QTY) {
      return { ok: false, message: `Quantity for ${it.code} must be between 1 and ${MAX_QTY}.` };
    }
  }
  return { ok: true };
}

async function verifyTurnstile(token: string, remoteIp: string | null): Promise<'pass' | 'fail' | 'error'> {
  const secret = env.TURNSTILE_SECRET_KEY;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);
  try {
    const res = await fetch(TURNSTILE_VERIFY, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) return 'error';
    const data = (await res.json()) as { success?: boolean };
    return data.success === true ? 'pass' : 'fail';
  } catch {
    return 'error';
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Readable recap email — plain structure, no styling that leaks into clients. */
function buildEmailHtml(p: Payload, names: Map<string, string>): string {
  const rows = p.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 12px 6px 0;border-bottom:1px solid #ddd;font-family:monospace;font-size:12px">${escapeHtml(it.code)}</td>` +
        `<td style="padding:6px 12px;border-bottom:1px solid #ddd;font-size:13px">${escapeHtml(names.get(it.code) ?? it.code)}</td>` +
        `<td style="padding:6px 0 6px 12px;border-bottom:1px solid #ddd;text-align:right;font-size:13px">${it.qty}</td></tr>`,
    )
    .join('');
  const field = (label: string, value?: string) =>
    `<p style="margin:0 0 12px;font-size:13px;line-height:1.6"><strong style="display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#726c5e;margin-bottom:2px">${label}</strong>${value ? escapeHtml(value) : '—'}</p>`;
  return [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px">',
    '<p style="font-size:15px;line-height:1.6;margin:0 0 20px">A new sample request arrived from the LAMINA site.</p>',
    `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:20px">`,
    `<tr><th align="left" style="padding:0 0 6px;border-bottom:2px solid #1b1914;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#726c5e">Article</th>` +
      `<th align="left" style="padding:0 0 6px;border-bottom:2px solid #1b1914;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#726c5e">Name</th>` +
      `<th align="right" style="padding:0 0 6px;border-bottom:2px solid #1b1914;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#726c5e">Qty</th></tr>`,
    rows,
    '</table>',
    field('Company', p.company),
    field('Contact', p.contact),
    field('Email', p.email),
    field('Phone', p.phone),
    field('Project / location', p.project),
    field('Notes', p.notes),
    `<p style="font-size:11px;color:#8a8271;font-family:monospace">Submission ${escapeHtml(p.submissionId)}</p>`,
    '</div>',
  ].join('');
}

async function sendEmail(p: Payload): Promise<boolean> {
  const key = env.RESEND_API_KEY;
  const from = env.RESEND_FROM ?? 'hello@lamina.studio';
  const to = env.RESEND_TO ?? 'hello@lamina.studio';
  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: p.email,
        subject: `Sample request — ${p.company} (${p.submissionId.slice(0, 8)})`,
        html: buildEmailHtml(p, await collectNames()),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  // Same-origin check — a third-party site must not POST here with a
  // forged form (Turnstile tokens are tied to the widget, but defense in
  // depth costs one header read). Browsers always send Origin on POST;
  // curl/tests may omit it, which is allowed.
  const origin = request.headers.get('origin');
  if (origin) {
    const url = new URL(request.url);
    if (new URL(origin).origin !== url.origin) {
      return json({ error: 'Origin not allowed.' }, 403);
    }
  }

  // Parse payload: JSON (fetch path) or form-encoded (no-JS native POST).
  const ct = request.headers.get('content-type') ?? '';
  const payload: Payload = {
    company: '',
    contact: '',
    email: '',
    items: [],
    submissionId: '',
    turnstileToken: '',
  };
  if (ct.includes('application/json')) {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return json({ error: 'Invalid JSON payload.' }, 400);
    }
    const r = raw as Record<string, unknown>;
    payload.company = str(r.company);
    payload.contact = str(r.contact);
    payload.email = str(r.email);
    payload.phone = str(r.phone);
    payload.project = str(r.project);
    payload.notes = str(r.notes);
    payload.submissionId = str(r.submission_id);
    payload.turnstileToken = str(r.turnstile_token);
    const items = Array.isArray(r.items) ? r.items : [];
    for (const it of items) {
      const o = it as Record<string, unknown>;
      payload.items.push({ code: str(o.code), qty: typeof o.qty === 'number' ? o.qty : NaN });
    }
  } else {
    const form = await request.formData();
    payload.company = str(form.get('company'));
    payload.contact = str(form.get('contact'));
    payload.email = str(form.get('email'));
    payload.phone = str(form.get('phone'));
    payload.project = str(form.get('project'));
    payload.notes = str(form.get('notes'));
    payload.submissionId = str(form.get('submission_id'));
    payload.turnstileToken = str(form.get('cf-turnstile-response'));
    // No-JS path: items come as a plain-text list, "CODE ×qty" per line.
    const parsed = parseItemsText(str(form.get('items_text')));
    if (!parsed.ok) {
      return json({ error: `Could not read article list: ${parsed.bad.join(', ')}` }, 400);
    }
    payload.items = parsed.items;
    // A no-JS submission has no client-generated id — mint one so the
    // duplicate guard still has something to hold on to.
    if (!payload.submissionId) {
      payload.submissionId = crypto.randomUUID();
    }
  }

  const check = validate(payload);
  if (!check.ok) return json({ error: check.message }, 400);

  // Duplicate submission guard — reject a resubmitted id before doing work.
  if (!remember(payload.submissionId)) {
    return json({ error: 'This request was already received. Please check your inbox or try again.' }, 409);
  }

  // Security check: server-side Turnstile verification.
  if (!env.TURNSTILE_SECRET_KEY) {
    return json({ error: 'Request submission is not configured yet. Please try again later.' }, 503);
  }
  const v = await verifyTurnstile(payload.turnstileToken, request.headers.get('cf-connecting-ip'));
  if (v === 'fail') {
    return json({ error: 'Security check failed — please complete the challenge and try again.' }, 400);
  }
  if (v === 'error') {
    return json({ error: 'Security check unavailable — please try again in a moment.' }, 502);
  }

  if (!env.RESEND_API_KEY) {
    return json({ error: 'Request submission is not configured yet. Please try again later.' }, 503);
  }
  if (!(await sendEmail(payload))) {
    return json({ error: 'Could not send the request — please try again in a moment.' }, 502);
  }

  // Form path: plain redirect (no-JS). Fetch path: JSON so the page can
  // clear the tray and navigate itself.
  if (ct.includes('application/json')) {
    return json({ ok: true, id: payload.submissionId });
  }
  return new Response(null, {
    status: 303,
    headers: { location: `/thank-you?id=${encodeURIComponent(payload.submissionId)}` },
  });
};
