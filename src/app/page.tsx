import Image from 'next/image';
import Link from 'next/link';
import {
  getArticles,
  getTopics,
  getTopStories,
  getDocumentaries,
  getBannerEpisodes,
  getArchive,
  getFestival,
  getPendingStories,
  getPodcastShow,
  getSite,
  archiveCapacity,
  riverDepth
} from '@/lib/content';
import { ArticleCard, StoryRow, RankedItem, PendingRow } from '@/components/Story';
import { FilmCard } from '@/components/Television';
import { PlatformLink } from '@/components/Icons';
import TopStories from '@/components/TopStories';
import PodcastBanner from '@/components/PodcastBanner';
import FestivalCarousel from '@/components/FestivalCarousel';
import Newsletter from '@/components/Newsletter';

export default async function Home() {
  const [
    articles,
    topics,
    documentaries,
    episodes,
    festival,
    // Five, not three: the trio plus one headline-only story hanging under
    // each flank to close the short columns. Everything after them fills the
    // rest of the page in order, so no story appears twice above the archive
    // rail. The river absorbs the loss, dropping from five rows to three.
    top,
    archive,
    // Commissioned but unwritten, and marked as such on the page. They carry
    // the river down to the foot of the archive rail.
    pending,
    show,
    site
  ] = await Promise.all([
    getArticles(),
    getTopics(),
    getDocumentaries(),
    getBannerEpisodes(3),
    getFestival(),
    getTopStories(5),
    getArchive(archiveCapacity),
    getPendingStories(),
    getPodcastShow(),
    getSite()
  ]);

  const led = new Set(top.map((a) => a.slug));
  const rest = articles.filter((a) => !led.has(a.slug));
  const grid = rest.slice(0, 3);
  // Capped, not "everything left over": see riverDepth in lib/content for why
  // the front page stops being a full index. What falls off the end is reached
  // through More → and the archive rail.
  const river = rest.slice(3, 3 + riverDepth);

  return (
    <>
      {/* ---------- Top stories ----------
          Three ranked stories carry the whole fold. Order comes from
          getTopStories: the `weight` an editor sets in the Studio, falling
          through to recency for everything unweighted, which is the normal
          case. */}
      {top.length > 0 && (
        <section className="hero shell" aria-labelledby="lead-heading">
          <TopStories stories={top} />
        </section>
      )}

      {/* ---------- Podcast ----------
          Supplied banner artwork across the top with up to three episodes
          under it. Anything not yet released carries no link and is marked
          "Coming soon". */}
      {episodes.length > 0 && (
        <section className="section section--band" id="podcasts" aria-labelledby="pod-heading">
          <PodcastBanner episodes={episodes} title={show.title} />
          <div className="shell podband__platforms">
            <p className="label label--muted">Listen on</p>
            <div className="platforms" style={{ marginTop: 'var(--space-2)' }}>
              {show.spotifyUrl && (
                <PlatformLink name="spotify" href={show.spotifyUrl} label="Listen on Spotify" />
              )}
              {show.appleUrl && (
                <PlatformLink
                  name="apple-podcasts"
                  href={show.appleUrl}
                  label="Listen on Apple Podcasts"
                />
              )}
              {site.youtube && (
                <PlatformLink name="youtube" href={site.youtube} label="Watch on YouTube" />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Latest ----------
          Every section on this page collapses when it has nothing in it. A
          heading with an empty well under it reads as a page that failed to
          load, and that is the state a newsroom sees on its first day. */}
      {grid.length > 0 && (
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
      )}

      {/* ---------- Analysis river + rail ---------- */}
      {(river.length > 0 || pending.length > 0 || archive.length > 0) && (
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
                {pending.map((s) => (
                  <PendingRow story={s} key={s.slug} />
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
              {archive.length > 0 && (
                <div>
                  <h2 className="rail__title">From the archive</h2>
                  {archive.map((a, i) => (
                    <RankedItem article={a} n={i + 1} key={`${a.slug}-${i}`} />
                  ))}
                </div>
              )}

              {site.pullQuote?.text && (
                <blockquote className="quote">
                  <p>“{site.pullQuote.text}”</p>
                  {site.pullQuote.attribution && <footer>{site.pullQuote.attribution}</footer>}
                </blockquote>
              )}
            </aside>
          </div>
        </section>
      )}

      {/* ---------- Documentaries ----------
          Collapses out of the page entirely when the strand is empty. */}
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
              {documentaries.slice(0, 3).map((f) => (
                <FilmCard film={f} key={f.slug} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Festival ----------
          The heading of this band is the standfirst, so with none the band is
          a navy well with a button in it. Hidden until there is something to
          say. */}
      {festival.standfirst && (
        <section className="fest on-navy" id="festival" aria-labelledby="fest-heading">
          <FestivalCarousel slides={festival.slides} />
          <div className="fest__scrim" />
          <div className="fest__inner shell">
            <span className="fest__kicker">
              {festival.name}
              {festival.datesAnnounced && festival.dates
                ? ` · ${festival.dates}`
                : ' · Inaugural edition'}
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
      )}

      {/* Renders nothing until an email provider is configured in Site
          settings. See the note in Newsletter.tsx. */}
      <Newsletter action={site.newsletterAction} />
    </>
  );
}
