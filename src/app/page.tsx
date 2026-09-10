import Image from 'next/image';
import Link from 'next/link';
import {
  getArticles,
  getTopics,
  getTopStories,
  getDocumentaries,
  getLatestEpisode,
  getArchive,
  getFestival,
  getFestivalSlides,
  archiveCapacity,
  canWatch,
  SITE
} from '@/lib/content';
import { ArticleCard, StoryRow, RankedItem } from '@/components/Story';
import { ProgrammeCard } from '@/components/Television';
import { PlatformLink } from '@/components/Icons';
import TopStories from '@/components/TopStories';
import FestivalCarousel from '@/components/FestivalCarousel';
import Newsletter from '@/components/Newsletter';

export default function Home() {
  const articles = getArticles();
  const topics = getTopics();
  const documentaries = getDocumentaries();
  const episode = getLatestEpisode();
  const festival = getFestival();
  const still = episode?.stills?.[0];

  // Five, not three: the trio plus one headline-only story hanging under each
  // flank to close the short columns. Everything after them fills the rest of
  // the page in order, so no story appears twice above the archive rail. The
  // river absorbs the loss, dropping from five rows to three.
  const top = getTopStories(5);
  const led = new Set(top.map((a) => a.slug));
  const rest = articles.filter((a) => !led.has(a.slug));
  const grid = rest.slice(0, 3);
  const river = rest.slice(3);
  const archive = getArchive(archiveCapacity);

  return (
    <>
      {/* ---------- Top stories ----------
          Three ranked stories carry the whole fold. Order comes from
          getTopStories, which falls through to recency until something is
          measuring; see the swap point in lib/content. */}
      <section className="hero shell" aria-labelledby="lead-heading">
        <TopStories stories={top} />
      </section>

      {/* ---------- Podcast ---------- */}
      {episode && (
        <section className="section section--band" id="podcasts" aria-labelledby="pod-heading">
          <div className="shell">
          <div className="section__head">
            <h2 id="pod-heading">The Nile Explorer Podcast</h2>
            <Link className="section__more" href="/podcasts">
              {canWatch(episode) ? 'Watch or listen →' : 'Listen →'}
            </Link>
          </div>
          <div className="withrail">
            <div>
              {/* While the video is withdrawn the lead still stands in for the
                  thumbnail. It is a photograph of this episode, not artwork. */}
              <Link
                className="frame frame--wide"
                href="/podcasts"
                aria-label={`Open episode ${episode.number}: ${episode.title}`}
              >
                {canWatch(episode) ? (
                  <>
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
                  </>
                ) : still ? (
                  <Image
                    src={still.src}
                    alt={still.alt}
                    width={still.width}
                    height={still.height}
                    sizes="(max-width: 1000px) 100vw, 700px"
                  />
                ) : (
                  <span className="player__holding">
                    <Image
                      src="/brand/podcast-logo.png"
                      alt="The Nile Explorer Podcast"
                      width={1729}
                      height={1660}
                      sizes="260px"
                    />
                  </span>
                )}
              </Link>
              {!canWatch(episode) && still && episode.photographer && (
                <p className="credit">Photograph by {episode.photographer}</p>
              )}
            </div>
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
              {episode.guests && episode.guests.length > 0 && (
                <div className="guests">
                  <p className="label label--muted">Featuring</p>
                  <ul className="guests__list">
                    {episode.guests.map((g) => (
                      <li key={g.name}>
                        <span className="guests__name">{g.name}</span>
                        <span className="guests__role">{g.role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {episode.topics && episode.topics.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <p className="label label--muted">In this episode</p>
                  <div className="chips" style={{ marginTop: 'var(--space-2)' }}>
                    {episode.topics.map((t) => (
                      <span className="chip chip--static" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="label label--muted" style={{ marginTop: 'var(--space-4)' }}>
                {canWatch(episode) ? 'Watch or listen on' : 'Listen on'}
              </p>
              <div className="platforms" style={{ marginTop: 'var(--space-2)' }}>
                <PlatformLink name="spotify" href={SITE.spotify} label="Listen on Spotify" />
                {canWatch(episode) && (
                  <PlatformLink name="youtube" href={episode.url} label="Watch on YouTube" />
                )}
              </div>
            </div>
          </div>
          </div>
        </section>
      )}

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
              {topics.map((t) => (
                <Link className="chip" href={`/articles?topic=${t.slug}`} key={t.slug}>
                  {t.name}
                  <span className="chip__n">{t.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rail" aria-label="Archive and comment">
            {/* Not "most read": there is no analytics source behind this site,
                so a popularity ranking would be invented. */}
            {/* Sized to reach the foot of the river. The pool is smaller than
                the rail, so getArchive cycles and headlines repeat until the
                archive is deep enough to fill it; keys carry the index because
                slugs are no longer unique here. */}
            <div>
              <h2 className="rail__title">From the archive</h2>
              {archive.map((a, i) => (
                <RankedItem article={a} n={i + 1} key={`${a.slug}-${i}`} />
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

      {/* ---------- Documentaries ----------
          Collapses out of the page entirely when the strand is empty, which it
          will be once the placeholder uploads come down. */}
      {documentaries.length > 0 && (
        <section
          className="section section--band"
          id="documentaries"
          aria-labelledby="docs-heading"
        >
          <div className="shell">
            <div className="section__head">
              <h2 id="docs-heading">Documentaries</h2>
              <Link className="section__more" href="/documentaries">
                All films →
              </Link>
            </div>
            <div className="cardgrid">
              {documentaries.slice(0, 3).map((v) => (
                <ProgrammeCard video={v} key={v.videoId} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Festival ---------- */}
      <section className="fest on-navy" id="festival" aria-labelledby="fest-heading">
        <FestivalCarousel slides={getFestivalSlides()} />
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
