import Link from 'next/link';
import { PlatformLink } from '@/components/Icons';
import Logo from '@/components/Logo';
import { getTopics, getSite, getPodcastShow } from '@/lib/content';

export default async function Footer() {
  const [topics, site, show] = await Promise.all([getTopics(), getSite(), getPodcastShow()]);

  return (
    <footer className="footer on-navy">
      <div className="footer__inner shell">
        <div className="footer__cols">
          <div className="footer__about">
            <Logo reversed />
            <p>{site.description}</p>
            <div className="footer__social">
              {site.youtube && (
                <PlatformLink
                  name="youtube"
                  href={site.youtube}
                  label={`${site.name} on YouTube`}
                />
              )}
              {show.spotifyUrl && (
                <PlatformLink
                  name="spotify"
                  href={show.spotifyUrl}
                  label={`${site.name} on Spotify`}
                />
              )}
              {/* Apple Podcasts appears only once the show is actually listed
                  there, so the site never links somewhere it is not. */}
              {show.appleUrl && (
                <PlatformLink
                  name="apple-podcasts"
                  href={show.appleUrl}
                  label={`${site.name} on Apple Podcasts`}
                />
              )}
              {site.instagram && (
                <PlatformLink
                  name="instagram"
                  href={site.instagram}
                  label={`${site.name} on Instagram`}
                />
              )}
            </div>
          </div>

          {/* A column heading with nothing under it reads as a broken page,
              which is exactly what a newsroom sees on its first day before
              anything is filed. */}
          {topics.length > 0 && (
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
          )}

          <div>
            <h2 className="footer__coltitle">Network</h2>
            <ul className="footer__list">
              <li>
                <Link href="/articles">Articles</Link>
              </li>
              <li>
                <Link href="/writers">Writers</Link>
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
          <span>
            © {new Date().getFullYear()} {site.name} Media Network
          </span>
          <span>{site.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
