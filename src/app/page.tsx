import Image from 'next/image';
import Link from 'next/link';
import {
  getArticles,
  getCategories,
  getTelevision,
  getLatestEpisode,
  getArchive,
  getFestival,
  formatDate,
  SITE
} from '@/lib/content';
import { ArticleCard, StoryRow, SideStory, RankedItem } from '@/components/Story';
import { ProgrammeCard } from '@/components/Television';
import { PlatformLink } from '@/components/Icons';
import Newsletter from '@/components/Newsletter';

export default function Home() {
  const articles = getArticles();
  const categories = getCategories();
  const television = getTelevision();
  const episode = getLatestEpisode();
  const festival = getFestival();

  const [lead, ...rest] = articles;
  const side = rest.slice(0, 3);
  const grid = rest.slice(3, 6);
  const river = rest.slice(6);
  const archive = getArchive(4);

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

          {/* Simply the next most recent pieces. Labelled as such rather than
              implying an editorial selection that does not exist. */}
          <div className="hero__side">
            <h2 className="rail__title">Top stories</h2>
            {side.map((a) => (
              <SideStory article={a} key={a.slug} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Latest ---------- */}
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

          <aside className="rail" aria-label="Archive and comment">
            {/* Not "most read": there is no analytics source behind this site,
                so a popularity ranking would be invented. */}
            <div>
              <h2 className="rail__title">From the archive</h2>
              {archive.map((a, i) => (
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
          </aside>
        </div>
      </section>

      {/* ---------- Podcast ---------- */}
      {episode && (
        <section className="section shell" id="podcasts" aria-labelledby="pod-heading">
          <div className="section__head">
            <h2 id="pod-heading">The Nile Explorer Podcast</h2>
            <Link className="section__more" href="/podcasts">
              Watch or listen →
            </Link>
          </div>
          <div className="withrail">
            <Link className="frame frame--wide" href="/podcasts" aria-label={`Play: ${episode.title}`}>
              <Image
                src={episode.thumbnail}
                alt={`Artwork for “${episode.title}”`}
                width={1280}
                height={720}
                sizes="(max-width: 1000px) 100vw, 700px"
              />
              <span className="playbadge" aria-hidden="true">
                <span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.2v13.6L19 12z" />
                  </svg>
                </span>
              </span>
            </Link>
            <div>
              <p className="card__cat">Episode {episode.number}</p>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--fs-h3)',
                  color: 'var(--navy)',
                  margin: '6px 0 var(--space-3)'
                }}
              >
                {episode.title}
              </h3>
              {(episode.blurb ?? episode.summary) && (
                <p className="episode__desc">{episode.blurb ?? episode.summary}</p>
              )}
              <p className="label label--muted" style={{ marginTop: 'var(--space-4)' }}>
                Watch or listen on
              </p>
              <div className="platforms" style={{ marginTop: 'var(--space-2)' }}>
                <PlatformLink name="spotify" href={SITE.spotify} label="Listen on Spotify" />
                <PlatformLink name="youtube" href={episode.url} label="Watch on YouTube" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Television ---------- */}
      {television.length > 0 && (
        <section className="section section--band" id="tv" aria-labelledby="tv-heading">
          <div className="shell">
            <div className="section__head">
              <h2 id="tv-heading">Television</h2>
              <Link className="section__more" href="/television">
                All programmes →
              </Link>
            </div>
            <div className="cardgrid">
              {television.slice(0, 3).map((v) => (
                <ProgrammeCard video={v} key={v.videoId} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Festival ---------- */}
      <section className="fest on-navy" id="festival" aria-labelledby="fest-heading">
        <div className="fest__scrim" />
        <div className="fest__inner shell">
          <span className="fest__kicker">
            {festival.name}
            {festival.datesAnnounced && festival.dates ? ` · ${festival.dates}` : ' · Inaugural edition'}
          </span>
          <h2 className="fest__title" id="fest-heading">
            {festival.standfirst}
          </h2>
          <p className="fest__blurb">{festival.blurb}</p>
          <div className="fest__actions">
            <Link className="btn btn--gold" href="/festival">
              About the festival
            </Link>
          </div>
          <div className="fest__days">
            {festival.strands.map((st) => (
              <div className="fest__day" key={st.name}>
                <span className="fest__date">{st.name}</span>
                <span className="fest__venue">{st.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
