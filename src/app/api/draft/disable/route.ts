import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Leave preview mode and go back to seeing the published site.
 *
 * Reached from the banner that appears while previewing. That banner uses a
 * form button rather than a link on purpose: Next prefetches links, which
 * would clear the cookie before anyone clicked anything.
 */
export async function POST() {
  const draft = await draftMode();
  draft.disable();
  redirect('/');
}
