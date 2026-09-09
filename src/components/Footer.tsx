import Link from 'next/link';
import { PlatformLink } from '@/components/Icons';
import Logo from '@/components/Logo';
import { getTopics, SITE } from '@/lib/content';

export default function Footer() {
  const topics = getTopics();

  return (
    <footer className="footer on-navy">
      <div className="footer__inner shell">
        <div className="footer__cols">
          <div className="footer__about">
            <Logo reversed />
            <p>{SITE.description}</p>
            <div className="footer__social">
              <PlatformLink name="youtube" href={SITE.youtube} label="The Nile Explorer on YouTube" />
              <PlatformLink name="spotify" href={SITE.spotify} label="The Nile Explorer on Spotify" />
              <PlatformLink
                name="instagram"
                href={SITE.instagram}
                label="The Nile Explorer on Instagram"
              />
            </div>
          </div>

          <div>
            <h2 className="footer__coltitle">Topics</h2>
            <ul className="footer__list">
              {topics.map((t) => (
                <li key={t.slug}>
                  <Link href={`/articles?topic=${t.slug}`}>{t.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer__coltitle">Network</h2>
            <ul className="footer__list">
              <li>
                <Link href="/articles">Articles</Link>
              </li>
              <li>
                <Link href="/podcasts">Podcast</Link>
              </li>
              <li>
                <Link href="/documentaries">Documentaries</Link>
              </li>
              <li>
                <Link href="/festival">The Nile Festival</Link>
              </li>
              <li>
                <Link href="/about">About &amp; contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__legal">
          <span>© {new Date().getFullYear()} The Nile Explorer Media Network</span>
          <span>{SITE.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
