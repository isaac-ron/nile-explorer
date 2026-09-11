import Image from 'next/image';
import Link from 'next/link';
import { type BannerEpisode, formatShortDate } from '@/lib/content';

/**
 * The podcast band: supplied banner artwork across the top, the episodes under
 * it as a lead and a stacked pair.
 *
 * The artwork is mounted as a background rather than an <img> because its
 * lower two-fifths are fully transparent. As a background that transparency
 * costs no layout space and the band's own ground shows through it, so there
 * is no colour to match and no seam where art meets page. `padding-top` is a
 * percentage of the band's width, which is exactly how the artwork scales, so
 * the episodes clear the swash at every viewport without a media query doing
 * the arithmetic.
 *
 * Layout: the episode that is out now takes two thirds of the width, and the
 * rest stack beside it at a third. The pair carries less than the lead — no
 * standfirst, smaller headline — so the two columns are unequal in weight as
 * well as in size, and the lead's picture stretches to whatever height the
 * stack ends up being, which keeps the bottom edge flush.
 *
 * Anything not yet released carries no link, because there is nothing behind
 * it to open, and is marked "Coming soon" rather than left to read as though
 * it were published.
 */

function EpisodeBody({ episode, lead }: { episode: BannerEpisode; lead: boolean }) {
  return (
    <>
      {episode.thumbnail && (
        <span className={`frame podep__thumb ${lead ? 'frame--card' : 'frame--wide'}`}>
          <Image
            src={episode.thumbnail}
            alt={episode.thumbnailAlt}
            width={lead ? 1280 : 640}
            height={lead ? 853 : 360}
            sizes={lead ? '(max-width: 760px) 100vw, 820px' : '(max-width: 760px) 100vw, 420px'}
          />
        </span>
      )}
      <span className="podep__no">
        Episode {episode.number}
        {!episode.published && <span className="mark mark--soon">Coming soon</span>}
      </span>
      <span className="podep__title">{episode.title}</span>
      {lead && <span className="podep__blurb">{episode.blurb}</span>}
      {episode.guests.length > 0 && (
        <span className="podep__guests">{episode.guests.map((g) => g.name).join(' · ')}</span>
      )}
      <span className="podep__meta">{formatShortDate(episode.date)}</span>
    </>
  );
}

function EpisodeCard({ episode, lead }: { episode: BannerEpisode; lead: boolean }) {
  const className = `podep ${lead ? 'podep--lead' : 'podep--side'}${
    episode.published ? '' : ' podep--unpublished'
  }`;
  const body = <EpisodeBody episode={episode} lead={lead} />;

  return episode.published ? (
    <Link className={className} href="/podcasts">
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export default function PodcastBanner({
  episodes,
  title
}: {
  episodes: BannerEpisode[];
  title: string;
}) {
  const [lead, ...side] = episodes;
  if (!lead) return null;

  return (
    <div className="podband">
      <div className="podband__art" role="presentation" />

      <div className="shell podband__inner">
        <div className="section__head">
          <h2 id="pod-heading">{title}</h2>
          <Link className="section__more" href="/podcasts">
            All episodes →
          </Link>
        </div>

        {/* Solo when there is only one episode: a card across the full width
            reads better than a two-thirds card with a hole beside it. */}
        <div className={`podgrid${side.length === 0 ? ' podgrid--solo' : ''}`}>
          <EpisodeCard episode={lead} lead />
          {side.length > 0 && (
            <div className="podside">
              {side.map((e) => (
                <EpisodeCard episode={e} lead={false} key={e.number} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
