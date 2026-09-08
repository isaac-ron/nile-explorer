import type { Metadata } from 'next';
import { Newsreader, Schibsted_Grotesk } from 'next/font/google';
import Masthead from '@/components/Masthead';
import Footer from '@/components/Footer';
import { SITE } from '@/lib/content';
import '@/styles/globals.css';

/**
 * Editorial voice.
 *
 * Newsreader is drawn for reading news on screen: sturdier stems and more
 * pronounced, slightly flared serifs than Spectral, which read as a
 * publication rather than a default web serif. It is variable, so headline
 * and body weights cost one file. Swap the family name here to try another;
 * nothing else in the stylesheet names a typeface.
 */
const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap'
});

/**
 * Furniture: kickers, nav, bylines, labels, chips — nearly all of it small
 * and letterspaced uppercase.
 *
 * Schibsted Grotesk was drawn for a news publisher, so it is built for
 * exactly that job: crisp caps that hold their shape at 11px, and a
 * grotesque discipline that supports the serif instead of competing with
 * it. Libre Franklin read softer and a touch generic beside Newsreader.
 * Variable, so the 500 weight the stylesheet asks for is a real cut rather
 * than a synthesised one.
 */
const sans = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    type: 'website',
    locale: 'en_GB'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Masthead />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
