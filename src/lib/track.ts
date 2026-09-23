/**
 * Browser half of the readership counter. The server half is /api/track.
 *
 * Counts feed the front page's Top stories (see getFrontPage). Nothing about
 * the reader is sent or stored — no cookie, no id, no IP — only "this article
 * was opened" or "this article was shared", added to a daily total.
 */

export type TrackKind = 'view' | 'share';

/** How long one browser's read of one article counts as a single read. */
const VIEW_WINDOW_MS = 12 * 60 * 60 * 1000;

/**
 * True the first time it is asked about `key` within `windowMs`, false after.
 *
 * Refreshing, or coming back to the tab, would otherwise count again, and the
 * ranking would favour whoever reloads most. Storage can be unavailable
 * (private windows, blocked site data); count anyway rather than never.
 */
function firstTimeIn(key: string, windowMs: number): boolean {
  try {
    const last = Number(localStorage.getItem(key));
    if (last && Date.now() - last < windowMs) return false;
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // fall through and count
  }
  return true;
}

export function track(slug: string, kind: TrackKind): void {
  if (kind === 'view' && !firstTimeIn(`ne:read:${slug}`, VIEW_WINDOW_MS)) return;
  if (kind === 'share' && !firstTimeIn(`ne:shared:${slug}`, VIEW_WINDOW_MS)) return;

  const body = JSON.stringify({ slug, kind });
  // sendBeacon survives the page being left, which is exactly when a share
  // click happens: the reader is on their way to WhatsApp.
  try {
    if (navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) return;
  } catch {
    // fall back to fetch
  }
  fetch('/api/track', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' },
    keepalive: true
  }).catch(() => {});
}
