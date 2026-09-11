import { draftMode } from 'next/headers';

/**
 * The bar that appears while an editor is previewing unpublished work.
 *
 * Without it, preview mode is invisible and sticky: an editor opens a preview,
 * forgets, and spends the afternoon convinced the live site shows edits that
 * nobody else can see.
 *
 * The exit is a form button rather than a link because Next prefetches links,
 * which would clear the cookie before anyone clicked it.
 */
export default async function DraftBanner() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;

  return (
    <div className="draftbar">
      <span>
        <strong>Preview.</strong> You are seeing unpublished changes. Nobody else can see this.
      </span>
      <form action="/api/draft/disable" method="post">
        <button type="submit">Leave preview</button>
      </form>
    </div>
  );
}
