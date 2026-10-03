import Link from 'next/link';
import Logo from '@/components/Logo';
import SiteNav, { type NavItem } from '@/components/SiteNav';
import { getStrands, getSite, NEWSROOM_TIME_ZONE } from '@/lib/content';
import { newsletterReady } from '@/lib/newsletter';

/**
 * Build the menu from Site settings.
 *
 * A menu item marked "show the strands underneath" grows a drop-down listing
 * every strand, so adding a strand adds a menu entry with nothing else to
 * remember. Documentaries is deliberately absent from the default menu: it
 * reaches the footer only.
 */
async function navItems(): Promise<NavItem[]> {
  const [site, strands] = await Promise.all([getSite(), getStrands()]);

  return site.nav.map((item) =>
    item.expandStrands
      ? {
          label: item.label,
          href: item.href,
          children: strands.map((s) => ({ label: s.name, href: `/more/${s.slug}` }))
        }
      : { label: item.label, href: item.href }
  );
}

export async function EditionBar() {
  const site = await getSite();
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: NEWSROOM_TIME_ZONE
  });

  return (
    <div className="editionbar on-navy">
      <div className="editionbar__inner shell">
        <span>
          {today} &nbsp;·&nbsp;
        </span>
        <span className="editionbar__links">
          {site.youtube && (
            <a href={site.youtube} target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
          )}
          {site.instagram && (
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
          <Link href="/about">Contact</Link>
        </span>
      </div>
    </div>
  );
}

export default async function Masthead() {
  const [items, subscribable] = await Promise.all([navItems(), newsletterReady()]);

  return (
    <>
      <EditionBar />
      <header className="masthead on-navy">
        <div className="masthead__inner shell">
          <Logo reversed preload />
          <SiteNav items={items} />
          {/* Gold, not the default navy fill: a navy button on a navy
              masthead has no edge. Hidden until a newsletter provider is
              configured, since the anchor would otherwise scroll to a section
              that does not render. */}
          {subscribable && (
            <Link className="btn btn--gold" href="/#newsletter">
              Subscribe
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
