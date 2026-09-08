import Image from 'next/image';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { SITE } from '@/lib/content';

const NAV = [
  // News and Opinion resolve to the same articles today, because every piece
  // published so far is commentary. They diverge as sourced reporting arrives.
  { label: 'News', href: '/articles' },
  { label: 'Opinion', href: '/articles?section=opinion' },
  { label: 'Podcast', href: '/podcasts' },
  { label: 'TV', href: '/television' },
  { label: 'Festival', href: '/festival' },
  { label: 'About', href: '/about' }
];

export function EditionBar() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="editionbar">
      <div className="editionbar__inner shell">
        <span>
          {today} &nbsp;·&nbsp; Juba
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
      <header className="masthead">
        <div className="masthead__inner shell">
          <Link className="logo" href="/" aria-label={`${SITE.name}, home`}>
            <Image
              className="logo__mark"
              src="/brand/logo-mark.png"
              alt=""
              width={889}
              height={1044}
              priority
            />
            <Image
              className="logo__word"
              src="/brand/logo-wordmark.png"
              alt={SITE.name}
              width={1729}
              height={334}
              priority
            />
          </Link>
          <SiteNav items={NAV} />
          <Link className="btn" href="/#newsletter">
            Subscribe
          </Link>
        </div>
      </header>
    </>
  );
}
