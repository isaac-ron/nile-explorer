/**
 * Root layout for the Studio, and deliberately nothing like the site's.
 *
 * The Studio used to render inside the site's layout, which meant the
 * newsroom worked underneath the masthead, above the footer, and inside
 * `<main>` — an application squeezed into a column built for an article. It
 * also inherited globals.css, so the site's reset and typography were fighting
 * Sanity's own.
 *
 * Two root layouts fix that: `(site)` keeps the masthead, the footer and the
 * fonts; `(studio)` has none of them. Route groups do not appear in the URL,
 * so /studio and every article address are unchanged.
 *
 * No globals.css import here, on purpose. The Studio ships its own styling and
 * anything of ours that reaches it is interference, not design. Studio
 * branding is set in sanity.config.ts instead, where it applies to the Studio's
 * own theme rather than by overriding its CSS from outside.
 *
 * The only rule here: give the Studio the full viewport. It manages its own
 * scrolling, and a body margin puts a permanent scrollbar on every screen.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
