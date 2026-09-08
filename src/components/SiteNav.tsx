'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { label: string; href: string };

/**
 * Section navigation.
 *
 * Desktop keeps the horizontal strip. Below 760px it becomes a disclosure
 * panel: eight sections never fit across a phone, and the previous approach
 * (a horizontally scrolling flex row) squeezed the items instead of scrolling
 * them, because flex children shrink by default. Labels ended up clipped
 * inside their own boxes.
 */
export default function SiteNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close after navigating, or the panel stays open over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

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
        className={open ? 'nav nav--open' : 'nav'}
        aria-label="Sections"
      >
        {items.map((n) => {
          const current =
            n.href === pathname || (n.href.startsWith(pathname) && pathname !== '/');
          return (
            <Link
              className="nav__link"
              href={n.href}
              key={n.href}
              aria-current={current ? 'page' : undefined}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
