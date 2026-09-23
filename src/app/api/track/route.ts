import type { NextRequest } from 'next/server';
import { client, sanityFetch } from '@/lib/sanity/client';
import { ARTICLE_ID_BY_SLUG_QUERY } from '@/lib/sanity/queries';

/**
 * Counts a read or a share of an article. The browser half is lib/track.ts.
 *
 * Each article gets one `articleStats` document, `stats-<article id>`, holding
 * lifetime totals and one bucket per day. The front page ranks on the recent
 * buckets; see getFrontPage.
 *
 * Kept deliberately separate from the article document itself. Patching the
 * article would put a new revision in its history on every page view, and
 * fire the publish webhook — which is filtered on type, and articleStats is
 * not in the list.
 *
 * Needs SANITY_API_WRITE_TOKEN (an Editor token). Without it every call is a
 * silent no-op, so the site still works, and the ranking falls back to
 * recency.
 */

/** Link unfurlers, crawlers and scripts. None of them is a reader. */
const NOT_A_READER =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|curl|wget|python|axios|node-fetch|go-http/i;

/** Readership older than this is dropped from the day buckets. */
const KEEP_DAYS = 30;

/**
 * A light brake on one address hammering the counter. Per server instance and
 * forgotten on every cold start, so it stops accidents and casual abuse rather
 * than anyone determined — which is the right size for a front-page ranking.
 */
const recent = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 60_000);
  hits.push(now);
  if (recent.size > 5000) recent.clear();
  recent.set(ip, hits);
  return hits.length > 20;
}

const dayKey = (d: Date): string => `d${d.toISOString().slice(0, 10).replace(/-/g, '')}`;

const writer = client.withConfig({ token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false });

const noContent = () => new Response(null, { status: 204 });

/**
 * Only the live site counts. Preview deployments and `npm run dev` read the
 * same Sanity dataset, so without this every developer click and every editor
 * checking a preview would be ranked as a reader. TRACK_READERSHIP=1 turns it
 * on anywhere, for testing.
 */
const COUNTING =
  process.env.VERCEL_ENV === 'production' || process.env.TRACK_READERSHIP === '1';

export async function POST(request: NextRequest) {
  if (!COUNTING || !process.env.SANITY_API_WRITE_TOKEN) return noContent();

  const ua = request.headers.get('user-agent') ?? '';
  if (!ua || NOT_A_READER.test(ua)) return noContent();

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (tooMany(ip)) return new Response(null, { status: 429 });

  let slug: unknown;
  let kind: unknown;
  try {
    ({ slug, kind } = await request.json());
  } catch {
    return new Response(null, { status: 400 });
  }
  if (
    typeof slug !== 'string' ||
    !/^[a-z0-9][a-z0-9-]{0,95}$/.test(slug) ||
    (kind !== 'view' && kind !== 'share')
  ) {
    return new Response(null, { status: 400 });
  }

  // Served from the Data Cache like every other published-content query, so
  // counting a read does not cost a Sanity request to look the article up.
  const id = await sanityFetch<string | null>(ARTICLE_ID_BY_SLUG_QUERY, { slug });
  if (!id) return new Response(null, { status: 404 });

  const now = new Date();
  const today = dayKey(now);
  const expired = dayKey(new Date(now.getTime() - KEEP_DAYS * 86_400_000));
  const field = kind === 'view' ? 'views' : 'shares';
  const statsId = `stats-${id}`;

  try {
    await writer
      .transaction()
      .createIfNotExists({
        _id: statsId,
        _type: 'articleStats',
        article: { _type: 'reference', _ref: id, _weak: true },
        views: 0,
        shares: 0,
        days: {}
      })
      .patch(statsId, (p) =>
        p
          .setIfMissing({ days: {} })
          .setIfMissing({ [`days.${today}`]: { views: 0, shares: 0 } })
          .unset([`days.${expired}`])
          .inc({ [field]: 1, [`days.${today}.${field}`]: 1 })
      )
      .commit({ visibility: 'async' });
  } catch (err) {
    // A lost count is not worth an error page, but it is worth a log line: a
    // revoked token would otherwise freeze the ranking without anyone noticing.
    console.error('Readership count failed:', err);
  }

  return noContent();
}
