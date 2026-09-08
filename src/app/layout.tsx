import type { Metadata } from 'next';
import { Newsreader, Libre_Franklin } from 'next/font/google';
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

const sans = Libre_Franklin({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
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
