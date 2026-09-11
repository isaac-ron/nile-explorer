import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../../../sanity/env';

/**
 * Reading content out of Sanity.
 *
 * The site is built statically: every query here runs at build time, and the
 * result is baked into the HTML. Publishing triggers a rebuild, so there is no
 * live request from a reader to Sanity for text — only for images, which come
 * straight from Sanity's CDN.
 *
 * That is why `useCdn` is false. The CDN serves content that can be up to a
 * minute stale, which is fine for a running site and exactly wrong for a build
 * that is supposed to capture what was just published.
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
 * Run a query, against drafts when previewing and published content otherwise.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  preview = false
): Promise<T> {
  if (preview && !process.env.SANITY_API_READ_TOKEN) {
    throw new Error(
      'Draft preview needs SANITY_API_READ_TOKEN. Add it to .env.local and to the Vercel ' +
        'project settings.'
    );
  }
  return (preview ? draftClient : client).fetch<T>(query, params);
}
