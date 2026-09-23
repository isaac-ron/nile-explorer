'use client';

import { useEffect, useState } from 'react';
import { PlatformLink, type PlatformName } from './Icons';
import { track } from '@/lib/track';

const LINKS = (url: string, title: string): { icon: PlatformName; label: string; href: string }[] => [
  {
    icon: 'x',
    label: 'Share this article on X',
    href: `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    icon: 'whatsapp',
    label: 'Share this article on WhatsApp',
    href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
  },
  {
    icon: 'facebook',
    label: 'Share this article on Facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  }
];

/**
 * Share buttons for an article.
 *
 * The address being shared is taken from the page the reader is actually on,
 * not from configuration. It used to be built from a stored site URL at build
 * time, which shipped links to nilexplorer.net — a domain that no longer
 * serves this site — on every share, and would do the same again the next
 * time the domain changes or someone shares from a preview deployment.
 *
 * `origin` is the server's best guess (Site settings → URL), used for the
 * first paint and for anyone without JavaScript. The browser replaces it with
 * its own origin as soon as it runs.
 *
 * Clicks are counted towards the article's ranking on the front page.
 */
export default function ShareLinks({
  slug,
  path,
  title,
  origin
}: {
  slug: string;
  path: string;
  title: string;
  origin: string;
}) {
  const [base, setBase] = useState(origin.replace(/\/$/, ''));
  useEffect(() => setBase(window.location.origin), []);

  return (
    <span className="share" onClick={() => track(slug, 'share')}>
      {LINKS(`${base}${path}`, title).map((s) => (
        <PlatformLink name={s.icon} href={s.href} label={s.label} key={s.icon} />
      ))}
    </span>
  );
}
