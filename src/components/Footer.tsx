import Image from 'next/image';
import Link from 'next/link';
import { getCategories, getArticles, SITE } from '@/lib/content';

export default function Footer() {
  const categories = getCategories();
  const recent = getArticles().slice(0, 4);

  return (
    <footer className="footer">
      <div className="footer__inner shell">
        <div className="footer__cols">
          <div className="footer__about">
            <Link className="logo" href="/" aria-label={`${SITE.name}, home`}>
              <Image
                className="logo__mark"
                src="/brand/logo-mark.png"
                alt=""
                width={889}
                height={1044}
              />
              <Image
                className="logo__word"
                src="/brand/logo-wordmark.png"
                alt={SITE.name}
                width={1729}
                height={334}
              />
            </Link>
            <p>{SITE.description}</p>
          </div>

          <div>
            <h2 className="footer__coltitle">Sections</h2>
            <ul className="footer__list">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/articles?category=${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer__coltitle">Recent</h2>
            <ul className="footer__list">
              {recent.map((a) => (
                <li key={a.slug}>
                  <Link href={`/articles/${a.slug}`}>
                    {a.title.length > 44 ? a.title.slice(0, 44).trimEnd() + '…' : a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer__coltitle">Network</h2>
            <ul className="footer__list">
              <li>
                <Link href="/podcasts">The Nile Explorer Podcast</Link>
              </li>
              <li>
                <a href={SITE.youtube} target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </li>
              <li>
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
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
