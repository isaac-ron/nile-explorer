import Link from 'next/link';
import Logo from '@/components/Logo';
import SiteNav, { type NavItem } from '@/components/SiteNav';
import { getStrands, SITE } from '@/lib/content';

const NAV: NavItem[] = [
  // News and Opinion resolve to the same articles today, because every piece
  // published so far is commentary. They diverge as sourced reporting arrives.
  { label: 'News', href: '/articles' },
  { label: 'Opinion', href: '/articles?section=opinion' },
  { label: 'Podcast', href: '/podcasts' },
  { label: 'Festival', href: '/festival' },
  { label: 'About', href: '/about' },
  // Documentaries is deliberately not here: it reaches the footer only.
  // The strands below have no articles yet; they exist so the newsroom has
  // somewhere to publish into. See getStrands in lib/content.
  {
    label: 'More',
    href: '/more',
    children: getStrands().map((s) => ({ label: s.name, href: `/more/${s.slug}` }))
  }
];

export function EditionBar() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="editionbar on-navy">
      <div className="editionbar__inner shell">
        <span>
          {today} &nbsp;·&nbsp; 
        </span>
        <span className="editionbar__links">
          <a href={SITE.youtube} target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
          <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <Link href="/about">Contact</Link>
        </span>
      </div>
    </div>
  );
}

export default function Masthead() {
  return (
    <>
      <EditionBar />
      <header className="masthead on-navy">
        <div className="masthead__inner shell">
          <Logo reversed priority />
          <SiteNav items={NAV} />
          {/* Gold, not the default navy fill: a navy button on a navy
              masthead has no edge. */}
          <Link className="btn btn--gold" href="/#newsletter">
            Subscribe
          </Link>
        </div>
      </header>
    </>
  );
}
