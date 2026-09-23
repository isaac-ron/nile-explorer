'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

/**
 * Counts one read of an article towards its front-page ranking.
 *
 * Waits a few seconds before counting, so a reader who bounces straight back
 * — or a link-preview fetcher that runs scripts — does not register. Renders
 * nothing.
 */
export default function ReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => track(slug, 'view'), 4000);
    return () => window.clearTimeout(t);
  }, [slug]);
  return null;
}
