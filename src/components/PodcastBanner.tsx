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
 * Two of the three episodes are invented; see podcast-meta.json. Those carry
 * no link, because there is nothing behind them to open.
 */
export default function PodcastBanner({ episodes }: { episodes: BannerEpisode[] }) {
  return (
    <div className="podband">
      <div className="podband__art" role="presentation" />

      <div className="shell podband__inner">
        <div className="section__head">
          <h2 id="pod-heading">The Nile Explorer Podcast</h2>
          <Link className="section__more" href="/podcasts">
            All episodes →
          </Link>
        </div>

        <div className="podgrid">
          {episodes.map((e) => {
            const body = (
              <>
                <span className="frame frame--wide podep__thumb">
                  <Image
                    src={e.thumbnail}
                    alt={e.thumbnailAlt}
                    width={640}
                    height={360}
                    sizes="(max-width: 700px) 100vw, 380px"
                  />
                </span>
                <span className="podep__no">
                  Episode {e.number}
                  {!e.published && <span className="mark mark--soon">Coming soon</span>}
                </span>
                <span className="podep__title">{e.title}</span>
                <span className="podep__blurb">{e.blurb}</span>
                {e.guests.length > 0 && (
                  <span className="podep__guests">
                    {e.guests.map((g) => g.name).join(' · ')}
                  </span>
                )}
                <span className="podep__meta">{formatShortDate(e.date)}</span>
              </>
            );

            return e.published ? (
              <Link className="podep" href="/podcasts" key={e.number}>
                {body}
              </Link>
            ) : (
              <div className="podep podep--unpublished" key={e.number}>
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
