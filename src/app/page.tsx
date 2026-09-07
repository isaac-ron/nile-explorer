import Image from 'next/image';
import Link from 'next/link';
import {
  getArticles,
  getCategories,
  getEpisodes,
  formatDate,
  formatShortDate,
  SITE
} from '@/lib/content';
import { ArticleCard, StoryRow, SideStory, RankedItem } from '@/components/Story';
import Newsletter from '@/components/Newsletter';

export default function Home() {
  const articles = getArticles();
  const categories = getCategories();
  const episodes = getEpisodes();

  const [lead, ...rest] = articles;
  const side = rest.slice(0, 3);
  const grid = rest.slice(3, 7);
  const river = rest.slice(7);
  const mostRead = [...articles].slice(2, 7);
  const latestEpisode = episodes[0];

  return (
    <>
      {/* ---------- Lead ---------- */}
      <section className="hero shell" aria-labelledby="lead-heading">
        <div className="hero__grid">
          <div className="hero__lead">
            <div className="kicker">
              <span className="kicker__cat">{lead.category.name}</span>
              <span className="kicker__rule" />
              <span className="kicker__meta">{formatDate(lead.date)}</span>
            </div>

            <Link href={`/articles/${lead.slug}`}>
              {lead.image && (
                <span className="frame frame--lede">
                  <Image
                    src={lead.image.url}
                    alt={lead.image.alt || `Illustration for “${lead.title}”`}
                    width={lead.image.width ?? 1200}
                    height={lead.image.height ?? 768}
                    sizes="(max-width: 1000px) 100vw, 820px"
                    priority
                  />
                </span>
              )}
              <h1 className="hero__title" id="lead-heading" style={{ marginTop: 'var(--space-4)' }}>
                {lead.title}
              </h1>
            </Link>

            <p className="hero__deck">{lead.summary}</p>
            <p className="hero__byline">
              By {lead.author} · {lead.readingTime} min read
            </p>
          </div>

          <div className="hero__side">
            <h2 className="rail__title">Also this week</h2>
            {side.map((a) => (
              <SideStory article={a} key={a.slug} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Latest grid ---------- */}
      <section className="section shell" aria-labelledby="latest-heading">
        <div className="section__head">
          <h2 id="latest-heading">Latest</h2>
          <Link className="section__more" href="/articles">
            All articles →
          </Link>
        </div>
        <div className="cardgrid">
          {grid.map((a) => (
            <ArticleCard article={a} key={a.slug} />
          ))}
        </div>
      </section>

      {/* ---------- Analysis river + rail ---------- */}
      <section className="section section--band" aria-labelledby="analysis-heading">
        <div className="shell withrail">
          <div>
            <div className="section__head">
              <h2 id="analysis-heading">Analysis &amp; opinion</h2>
              <Link className="section__more" href="/articles">
                More →
              </Link>
            </div>
            <div className="river">
              {river.map((a) => (
                <StoryRow article={a} key={a.slug} />
              ))}
            </div>

            <div className="chips" style={{ marginTop: 'var(--space-5)' }}>
              {categories.map((c) => (
                <Link className="chip" href={`/articles?category=${c.slug}`} key={c.slug}>
                  {c.name}
                  <span className="chip__n">{c.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rail" aria-label="Most read and comment">
            <div>
              <h2 className="rail__title">Most read</h2>
              {mostRead.map((a, i) => (
                <RankedItem article={a} n={i + 1} key={a.slug} />
              ))}
            </div>

            <blockquote className="quote">
              <p>
                “We must shift from blame to responsibility, from suspicion to trust, from division
                to unity.”
              </p>
              <footer>{SITE.patron} · Patron</footer>
            </blockquote>

            {latestEpisode && (
              <div className="railcard">
                <p className="label label--muted">Listen</p>
                <Image
                  src="/brand/podcast-logo.png"
                  alt="The Nile Explorer Podcast"
                  width={1729}
                  height={1660}
                  style={{ width: '100%', maxWidth: 170, height: 'auto', margin: '10px 0 12px' }}
                />
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.02rem', lineHeight: 1.25, color: 'var(--navy)' }}>
                  {latestEpisode.title}
                </p>
                <Link
                  className="section__more"
                  href="/podcasts"
                  style={{ marginTop: 10, borderBottomColor: 'var(--gold)' }}
                >
                  Play episode →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ---------- Podcast ---------- */}
      <section className="section shell" id="podcasts" aria-labelledby="pod-heading">
        <div className="section__head">
          <h2 id="pod-heading">The Nile Explorer Podcast</h2>
          <Link className="section__more" href="/podcasts">
            All episodes →
          </Link>
        </div>
        <div className="cardgrid">
          {episodes.slice(0, 4).map((e) => (
            <a
              className="card"
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              key={e.videoId}
            >
              <span className="frame frame--wide">
                <Image
                  src={e.thumbnail}
                  alt={`Thumbnail for “${e.title}”`}
                  width={1280}
                  height={720}
                  sizes="(max-width: 700px) 100vw, 300px"
                />
                <span className="playbadge" aria-hidden="true">
                  <span>▶</span>
                </span>
              </span>
              <span className="card__cat">Episode {e.number}</span>
              <span className="card__title">{e.title}</span>
              <span className="card__meta">{formatShortDate(e.published)}</span>
            </a>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
