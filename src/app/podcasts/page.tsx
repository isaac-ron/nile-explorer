import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  getPodcast,
  getTelevision,
  getArchive,
  formatDate,
  SITE
} from '@/lib/content';
import PodcastPlayer from '@/components/PodcastPlayer';
import { RankedItem } from '@/components/Story';
import { PlatformLink } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'The Nile Explorer Podcast',
  description:
    'Conversations on peace, governance and the future of South Sudan and the Nile basin. Watch on YouTube or listen on Spotify.'
};

export default function PodcastsPage() {
  const podcast = getPodcast();
  const [latest, ...older] = podcast.episodes;
  const programmes = getTelevision().slice(0, 3);
  const archive = getArchive(4);

  return (
    <section className="section">
      <div className="shell withrail">
        <div>
          <div className="section__head">
            <h1 style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>
              The Nile Explorer Podcast
            </h1>
            <span className="label label--muted">
              {podcast.episodes.length === 1
                ? 'Episode 1 out now'
                : `${podcast.episodes.length} episodes`}
            </span>
          </div>

          {latest && (
            <>
              <p className="card__cat">Episode {latest.number}</p>
              <h2
                style={{
                  fontSize: 'var(--fs-h3)',
                  color: 'var(--navy)',
                  margin: '6px 0 var(--space-4)',
                  maxWidth: '34ch'
                }}
              >
                {latest.title}
              </h2>

              <PodcastPlayer episode={latest} podcast={podcast} />

              {latest.summary && (
                <p className="episode__desc" style={{ marginTop: 'var(--space-4)' }}>
                  {latest.summary}
                </p>
              )}
              <p className="card__meta" style={{ marginTop: 'var(--space-2)' }}>
                Published {formatDate(latest.published)}
              </p>
            </>
          )}

          {older.length > 0 && (
            <>
              <div className="section__head" style={{ marginTop: 'var(--space-6)' }}>
                <h2>Previous episodes</h2>
              </div>
              <div>
                {older.map((e) => (
                  <a
                    className="episode"
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={e.videoId}
                  >
                    <span className="frame frame--wide">
                      <Image src={e.thumbnail} alt="" width={1280} height={720} sizes="210px" />
                    </span>
                    <span className="episode__body">
                      <span className="card__cat">Episode {e.number}</span>
                      <span className="episode__title">{e.title}</span>
                      <span className="card__meta">{formatDate(e.published)}</span>
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="rail" aria-label="Subscribe and more">
          <div className="railcard">
            <Image
              src="/brand/podcast-logo.png"
              alt="The Nile Explorer Podcast"
              width={1729}
              height={1660}
              style={{ width: '100%', height: 'auto' }}
            />
            <p
              style={{
                marginTop: 'var(--space-3)',
                fontSize: 'var(--fs-small)',
                color: 'var(--ink-blurb)',
                lineHeight: 1.55
              }}
            >
              Conversations on peace, governance and the future of the Nile basin, recorded in Juba.
            </p>
            <p className="label label--muted" style={{ marginTop: 'var(--space-4)' }}>
              Subscribe
            </p>
            <div className="platforms" style={{ marginTop: 'var(--space-2)' }}>
              <PlatformLink name="spotify" href={podcast.spotify.url} label="Listen on Spotify" />
              <PlatformLink name="youtube" href={SITE.youtube} label="Watch on YouTube" />
              <PlatformLink name="instagram" href={SITE.instagram} label="Follow on Instagram" />
            </div>
          </div>

          {programmes.length > 0 && (
            <div>
              <h2 className="rail__title">Also on Television</h2>
              {programmes.map((v) => (
                <a
                  className="sidestory"
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={v.videoId}
                >
                  <span className="card__cat">Programme</span>
                  <span className="sidestory__title">{v.title}</span>
                </a>
              ))}
              <Link className="section__more" href="/television" style={{ marginTop: 10 }}>
                All programmes →
              </Link>
            </div>
          )}

          <div>
            <h2 className="rail__title">From the archive</h2>
            {archive.map((a, i) => (
              <RankedItem article={a} n={i + 1} key={a.slug} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
