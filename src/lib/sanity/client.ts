import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../../../sanity/env';

/**
 * Reading content out of Sanity.
 *
 * Pages are static HTML, regenerated in the background (ISR): a publish in the
 * Studio calls /api/revalidate, which expires the cached query results, and the
 * next visitor's request rebuilds the page from fresh ones. Readers never wait
 * on Sanity and never trigger a query per page view — results are shared across
 * every page and every reader until they are expired.
 *
 * That is why `useCdn` is false. The CDN serves content that can be up to a
 * minute stale, and the webhook fires the moment something is published: a
 * regeneration that read the CDN would cache the old version for another
 * fifteen minutes.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published'
});

/**
 * The same, but able to see unpublished drafts.
 *
 * Only used behind Draft Mode, from /api/draft. It needs a read token because
 * drafts are never readable without one — Sanity filters them out of
 * unauthenticated queries even on a public dataset.
 *
 * The token is a server secret. Importing this into a client component would
 * ship it to the browser; everything that uses it is server-only.
 */
export const draftClient = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'drafts',
  useCdn: false,
  stega: false
});

/**
 * The tag every published-content query carries. /api/revalidate expires it
 * when Sanity reports a publish, which is what puts a new article on the front
 * page within seconds rather than at the next deploy.
 */
export const CONTENT_TAG = 'sanity';

/**
 * How stale published content may get if the publish webhook never arrives.
 *
 * The webhook is the normal path. This is the safety net: the front page used
 * to be frozen at whatever the last build saw, so a publish that failed to
 * trigger a rebuild was invisible on the home page indefinitely while
 * /articles, which renders per request, showed it straight away.
 */
export const CONTENT_REVALIDATE = 900;

type FetchOptions = { revalidate?: number; tags?: string[] };

/**
 * Run a query, against drafts when previewing and published content otherwise.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  preview = false,
  { revalidate = CONTENT_REVALIDATE, tags = [CONTENT_TAG] }: FetchOptions = {}
): Promise<T> {
  if (preview) {
    if (!process.env.SANITY_API_READ_TOKEN) {
      throw new Error(
        'Draft preview needs SANITY_API_READ_TOKEN. Add it to .env.local and to the Vercel ' +
          'project settings.'
      );
    }
    return draftClient.fetch<T>(query, params, { cache: 'no-store' });
  }
  return client.fetch<T>(query, params, { next: { revalidate, tags } });
}
