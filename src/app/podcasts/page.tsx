import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  getPodcast,
  getEpisodes,
  getUpcoming,
  getPodcastMeta,
  toPlayerEpisode,
  getDocumentaries,
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
  const meta = getPodcastMeta();
  const [latest, ...older] = getEpisodes();
  const upcoming = getUpcoming();
  const programmes = getDocumentaries().slice(0, 3);
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

          <p className="episode__desc" style={{ marginBottom: 'var(--space-5)' }}>
            {meta.show.blurb} <em>{meta.show.tagline}</em>
          </p>

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

              <PodcastPlayer
                episode={toPlayerEpisode(latest)}
                podcast={{ title: podcast.title, spotify: podcast.spotify }}
              />

              {(latest.blurb ?? latest.summary) && (
                <p className="episode__desc" style={{ marginTop: 'var(--space-4)' }}>
                  {latest.blurb ?? latest.summary}
                </p>
              )}

              {latest.guests && latest.guests.length > 0 && (
                <div className="guests">
                  <p className="label label--muted">Featuring</p>
                  <ul className="guests__list">
                    {latest.guests.map((g) => (
                      <li key={g.name}>
                        <span className="guests__name">{g.name}</span>
                        <span className="guests__role">{g.role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {latest.topics && latest.topics.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <p className="label label--muted">In this episode</p>
                  <div className="chips" style={{ marginTop: 'var(--space-2)' }}>
                    {latest.topics.map((t) => (
                      <span className="chip chip--static" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="card__meta" style={{ marginTop: 'var(--space-4)' }}>
                Published {formatDate(latest.published)}
              </p>
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <div className="section__head" style={{ marginTop: 'var(--space-6)' }}>
                <h2>Coming up</h2>
              </div>
              <div>
                {upcoming.map((u) => (
                  <article className="upcoming" key={u.title}>
                    <span className="upcoming__when">
                      {u.releaseDate ? u.releaseDate : 'Date to be announced'}
                    </span>
                    <div className="episode__body">
                      <h3 className="episode__title">{u.title}</h3>
                      {u.blurb && <p className="episode__desc">{u.blurb}</p>}
                      {u.guests && u.guests.length > 0 && (
                        <p className="card__meta">
                          With {u.guests.map((g) => g.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
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
              Conversations on peace, governance and the future of the Nile basin, recorded in  Nairobi.
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
              <h2 className="rail__title">Also in Documentaries</h2>
              {programmes.map((v) => (
                <a
                  className="sidestory"
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={v.videoId}
                >
                  <span className="card__cat">Film</span>
                  <span className="sidestory__title">{v.title}</span>
                </a>
              ))}
              <Link className="section__more" href="/documentaries" style={{ marginTop: 10 }}>
                All films →
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
