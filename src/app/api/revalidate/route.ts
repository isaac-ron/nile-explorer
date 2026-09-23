import type { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { parseBody } from 'next-sanity/webhook';
import { CONTENT_TAG } from '@/lib/sanity/client';

/**
 * Called by Sanity whenever something is published.
 *
 * Expires every cached published-content query, so the next request for any
 * page rebuilds it from what is in Sanity now. This replaces the Vercel Deploy
 * Hook: a full rebuild took a minute and, if the hook was not set up, never
 * happened at all, which is how new articles came to appear on /articles
 * (rendered per request) but never on the front page (rendered once, at the
 * last deploy).
 *
 * Set up at sanity.io/manage → API → Webhooks; see HANDOVER.md for the exact
 * settings. The secret there and SANITY_REVALIDATE_SECRET here must match. The
 * signature check is what stops anyone else from flushing the site's cache on
 * a loop.
 *
 * `{ expire: 0 }` rather than the "max" profile Next recommends: with "max" the
 * first visitor after a publish is shown the old page while the new one
 * builds, and that visitor is nearly always the editor who just pressed
 * Publish and is checking it worked.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new Response('SANITY_REVALIDATE_SECRET is not set.', { status: 500 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);
  if (!isValidSignature) return new Response('Invalid signature.', { status: 401 });

  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
}
