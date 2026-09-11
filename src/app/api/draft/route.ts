import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { draftClient } from '@/lib/sanity/client';

/**
 * Preview an unpublished draft.
 *
 * The Studio's Preview button opens this with a secret and the document being
 * edited. It sets a cookie that makes the site read drafts instead of
 * published content for this browser only, then sends the editor to the page.
 *
 * Two things here are security, not ceremony.
 *
 * The secret stops a stranger who guesses the address from reading unpublished
 * work — everything under Draft Mode bypasses the cache and hits Sanity with a
 * read token.
 *
 * The redirect target is the slug looked up in Sanity, never the one in the
 * query string. Redirecting straight to a user-supplied value is an open
 * redirect: a link that looks like it goes to the site and lands somewhere
 * else entirely.
 */

/** Where a document type is seen on the site. */
const PATHS: Record<string, string> = {
  aboutPage: '/about',
  festival: '/festival',
  episode: '/podcasts',
  podcastShow: '/podcasts',
  film: '/documentaries',
  siteSettings: '/'
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');
  const type = searchParams.get('type') ?? '';
  const id = searchParams.get('id');

  if (!process.env.SANITY_DRAFT_SECRET || !process.env.SANITY_API_READ_TOKEN) {
    return new Response(
      'Preview is not set up. SANITY_DRAFT_SECRET and SANITY_API_READ_TOKEN are missing.',
      { status: 500 }
    );
  }

  if (secret !== process.env.SANITY_DRAFT_SECRET) {
    return new Response('Invalid preview link.', { status: 401 });
  }

  // Types with their own page: fetch the slug rather than trusting the query.
  let destination = PATHS[type];

  if (!destination && id) {
    const doc = await draftClient.fetch<{ _type: string; slug?: string } | null>(
      `*[_id == $id][0]{ _type, "slug": slug.current }`,
      { id }
    );

    if (!doc) return new Response('That document could not be found.', { status: 404 });

    if (doc._type === 'article' && doc.slug) destination = `/articles/${doc.slug}`;
    else if (doc._type === 'strand' && doc.slug) destination = `/more/${doc.slug}`;
    else destination = PATHS[doc._type] ?? '/';
  }

  if (!destination) return new Response('Nothing to preview.', { status: 400 });

  const draft = await draftMode();
  draft.enable();

  redirect(destination);
}
