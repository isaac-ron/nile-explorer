/**
 * The Sanity Studio, mounted at /studio.
 *
 * This is where the newsroom works. The route is a catch-all because the
 * Studio does its own routing underneath — /studio/structure/article and so on
 * are all this one page.
 *
 * Access is controlled by Sanity, not by the site: signing in here needs a
 * Sanity account that has been invited to the project. See HANDOVER.md.
 *
 * The config is imported by ./Studio.tsx rather than here; see the note there.
 */
import Studio from './Studio';

export const dynamic = 'force-static';

export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  return <Studio />;
}
