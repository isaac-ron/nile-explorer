import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { draftClient } from '@/lib/sanity/client';

/**
 * Preview an unpublished draft.
 *
 * The Studio's Preview and "Publish & view" buttons (sanity/actions.tsx) open
 * this in a new tab. It sets the Draft Mode cookie, which makes every page
 * read drafts instead of published content for this browser only, then sends
 * the editor to the page.
 *
 * How it knows the request came from an editor: the Studio, signed in as that
 * editor, writes a one-hour secret into the dataset and puts it in the link.
 * Only someone who can write to the dataset can make one, and this route
 * checks it against the dataset with the read token. No shared password sits
 * in the Studio's JavaScript — which is served publicly at /studio, so any
 * password in it would be readable by anyone.
 *
 * The destination must be a path on this site. validatePreviewUrl only
 * releases it once the secret checks out, and it is checked again below: a
 * redirect straight to a value from the query string is an open redirect, a
 * link that looks like it goes to the site and lands somewhere else.
 */
export async function GET(request: NextRequest) {
  if (!process.env.SANITY_API_READ_TOKEN) {
    return new Response('Preview is not set up: SANITY_API_READ_TOKEN is missing.', {
      status: 500
    });
  }

  const { isValid, redirectTo = '/' } = await validatePreviewUrl(draftClient, request.url);
  if (!isValid) {
    return new Response('This preview link has expired. Press Preview in the Studio again.', {
      status: 401
    });
  }

  const destination = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/';

  const draft = await draftMode();
  draft.enable();

  redirect(destination);
}
