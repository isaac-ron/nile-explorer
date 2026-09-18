import Image from 'next/image';
import Link from 'next/link';
import { type BannerEpisode, formatShortDate } from '@/lib/content';

/**
 * The podcast band: supplied banner artwork across the top, three episodes
 * under it as equal cards.
 *
 * The artwork is mounted as a background rather than an <img> because its
 * lower two-fifths are fully transparent. As a background that transparency
 * costs no layout space and the band's own ground shows through it, so there
 * is no colour to match and no seam where art meets page. `padding-top` is a
 * percentage of the band's width, which is exactly how the artwork scales, so
 * the episodes clear the swash at every viewport without a media query doing
 * the arithmetic.
 *
 * Equal cards rather than a lead and a stacked pair. The lead treatment ran
 * the band 674px deep against 433px for this one, and the depth read to the
 * client as wasted space. Three abreast is the denser version and the one
 * they asked to keep.
 *
 * Anything not yet released carries no link, because there is nothing behind
 * it to open, and is marked "Coming soon" rather than left to read as though
 * it were published.
 */

function EpisodeBody({ episode }: { episode: BannerEpisode }) {
  return (
    <>
      {/* Guarded: an episode whose video has been withdrawn, or one announced
          before it is recorded, has no thumbnail to show. */}
      {episode.thumbnail && (
        <span className="frame frame--wide podep__thumb">
          <Image
            src={episode.thumbnail}
            alt={episode.thumbnailAlt}
            width={640}
            height={360}
            sizes="(max-width: 700px) 100vw, 380px"
          />
        </span>
      )}
      <span className="podep__no">
        Episode {episode.number}
        {!episode.published && <span className="mark mark--soon">Coming soon</span>}
      </span>
      <span className="podep__title">{episode.title}</span>
      <span className="podep__blurb">{episode.blurb}</span>
      {episode.guests.length > 0 && (
        <span className="podep__guests">{episode.guests.map((g) => g.name).join(' · ')}</span>
      )}
      <span className="podep__meta">{formatShortDate(episode.date)}</span>
    </>
  );
}

function EpisodeCard({ episode }: { episode: BannerEpisode }) {
  const body = <EpisodeBody episode={episode} />;

  return episode.published ? (
    <Link className="podep" href="/podcasts">
      {body}
    </Link>
  ) : (
    <div className="podep podep--unpublished">{body}</div>
  );
}

export default function PodcastBanner({
  episodes,
  title
}: {
  episodes: BannerEpisode[];
  title: string;
}) {
  if (episodes.length === 0) return null;

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

        <div className="podgrid">
          {episodes.map((e) => (
            <EpisodeCard episode={e} key={e.number} />
          ))}
        </div>
      </div>
    </div>
  );
}
