'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = {
  label: string;
  href: string;
  /** Present on "More": renders a menu instead of a link. */
  children?: { label: string; href: string }[];
};

/**
 * Section navigation.
 *
 * Desktop keeps the horizontal strip. Below 900px it becomes a disclosure
 * panel: the sections never fit across a phone, and the previous approach (a
 * horizontally scrolling flex row) squeezed the items instead of scrolling
 * them, because flex children shrink by default.
 *
 * "More" carries a submenu. On desktop it is a button-triggered menu; in the
 * mobile panel it flattens to an indented sub-list, because a dropdown inside
 * a disclosure is two nested layers of hiding and nobody finds the second one.
 */
export default function SiteNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const menuId = useId();

  /**
   * Which form "More" takes. Deciding this in JS rather than CSS is what lets
   * the two forms differ structurally: a dropdown needs the submenu genuinely
   * hidden, the panel needs it genuinely present, and no amount of display
   * toggling gives both without lying to assistive tech about one of them.
   *
   * There is no flash to worry about: the panel only exists once this
   * component has hydrated, so nothing renders in the wrong mode on screen.
   */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Close after navigating, or the panel stays open over the new page.
  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!open && !menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (menu) {
        setMenu(null);
        // Return focus to the trigger, or the ring vanishes into the page.
        navRef.current?.querySelector<HTMLButtonElement>('.nav__more')?.focus();
        return;
      }
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, menu]);

  // A click anywhere outside dismisses the submenu. Pointerdown rather than
  // click so it closes before the next control takes focus.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menu]);

  const isCurrent = (href: string) =>
    href === pathname || (pathname !== '/' && href !== '/' && pathname.startsWith(href));

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="navtoggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="navtoggle__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="vh">{open ? 'Close sections menu' : 'Open sections menu'}</span>
      </button>

      <nav
        id="site-nav"
        ref={navRef}
        className={open ? 'nav nav--open' : 'nav'}
        aria-label="Sections"
      >
        {items.map((n) => {
          if (!n.children) {
            return (
              <Link
                className="nav__link"
                href={n.href}
                key={n.href}
                aria-current={isCurrent(n.href) ? 'page' : undefined}
              >
                {n.label}
              </Link>
            );
          }

          const childCurrent = n.children.some((c) => isCurrent(c.href));
          const expanded = menu === n.label;

          const links = n.children.map((c) => (
            <Link
              className="nav__menulink"
              href={c.href}
              key={c.href}
              aria-current={isCurrent(c.href) ? 'page' : undefined}
            >
              {c.label}
            </Link>
          ));

          // In the panel there is nothing to hide: the label becomes a link to
          // the strand index and its children are listed under it.
          if (compact) {
            return (
              <div className="nav__group" key={n.label}>
                <Link
                  className="nav__link"
                  href={n.href}
                  aria-current={isCurrent(n.href) ? 'page' : undefined}
                >
                  {n.label}
                </Link>
                <div className="nav__menu">{links}</div>
              </div>
            );
          }

          return (
            <div className="nav__group" key={n.label}>
              <button
                type="button"
                className="nav__link nav__more"
                aria-expanded={expanded}
                aria-controls={menuId}
                aria-current={childCurrent ? 'page' : undefined}
                onClick={() => setMenu(expanded ? null : n.label)}
              >
                {n.label}
                <svg
                  className="nav__chev"
                  width="9"
                  height="6"
                  viewBox="0 0 9 6"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l3.5 3.5L8 1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </button>

              <div id={menuId} className="nav__menu" hidden={!expanded}>
                {links}
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );
}
