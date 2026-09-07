import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/content';

const NAV = [
  { label: 'Latest', href: '/articles' },
  { label: 'Opinion', href: '/articles?category=opinion' },
  { label: 'Peace', href: '/articles?category=peace' },
  { label: 'Geopolitics', href: '/articles?category=geo-politics' },
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
          <nav className="nav" aria-label="Sections">
            {NAV.map((n) => (
              <Link className="nav__link" href={n.href} key={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
          <Link className="btn" href="/#newsletter">
            Subscribe
          </Link>
        </div>
      </header>
    </>
  );
}
