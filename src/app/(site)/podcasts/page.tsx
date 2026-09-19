import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  getReleasedEpisodes,
  getUpcoming,
  getPodcastShow,
  toPlayerEpisode,
  getDocumentaries,
  getArchive,
  getSite,
  formatDate
} from '@/lib/content';
import PodcastPlayer from '@/components/PodcastPlayer';
import { RankedItem } from '@/components/Story';
import { PlatformLink } from '@/components/Icons';

export async function generateMetadata(): Promise<Metadata> {
  const show = await getPodcastShow();
  return {
    title: show.title,
    description:
      show.blurb ??
      'Conversations on peace, governance and the future of South Sudan and the Nile basin.'
  };
}

export default async function PodcastsPage() {
  const [show, released, upcoming, films, archive, site] = await Promise.all([
    getPodcastShow(),
    getReleasedEpisodes(),
    getUpcoming(),
    getDocumentaries(),
    getArchive(4),
    getSite()
  ]);
  const [latest, ...older] = released;
  const programmes = films.slice(0, 3);

  return (
    <section className="section">
      <div className="shell withrail">
        <div>
          <div className="section__head">
            <h1 style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>{show.title}</h1>
            <span className="label label--muted">
              {released.length === 1 ? 'Episode 1 out now' : `${released.length} episodes`}
            </span>
          </div>

          {(show.blurb || show.tagline) && (
            <p className="episode__desc" style={{ marginBottom: 'var(--space-5)' }}>
              {show.blurb} {show.tagline && <em>{show.tagline}</em>}
            </p>
          )}

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
                podcast={{
                  title: show.title,
                  spotifyUrl: show.spotifyUrl,
                  spotifyEmbed: show.spotifyEmbed
                }}
              />

              {latest.blurb && (
                <p className="episode__desc" style={{ marginTop: 'var(--space-4)' }}>
                  {latest.blurb}
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
                      {u.releaseDate ? formatDate(u.releaseDate) : 'Date to be announced'}
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
                {older.map((e) => {
                  const body = (
                    <>
                      {/* Null while the video is withdrawn, so neither the
                          thumbnail nor the link carries the video id. */}
                      {e.thumbnail && (
                        <span className="frame frame--wide">
                          <Image
                            src={e.thumbnail}
                            alt=""
                            width={1280}
                            height={720}
                            sizes="210px"
                          />
                        </span>
                      )}
                      <span className="episode__body">
                        <span className="card__cat">Episode {e.number}</span>
                        <span className="episode__title">{e.title}</span>
                        <span className="card__meta">{formatDate(e.published)}</span>
                      </span>
                    </>
                  );

                  return e.url ? (
                    <a
                      className="episode"
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={e.id}
                    >
                      {body}
                    </a>
                  ) : (
                    <article className="episode" key={e.id}>
                      {body}
                    </article>
                  );
                })}
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
            {show.tagline && (
              <p
                style={{
                  marginTop: 'var(--space-3)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.02rem',
                  color: 'var(--navy)',
                  lineHeight: 1.35
                }}
              >
                {show.tagline}
              </p>
            )}
            <p className="label label--muted" style={{ marginTop: 'var(--space-4)' }}>
              Subscribe
            </p>
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
              {site.instagram && (
                <PlatformLink name="instagram" href={site.instagram} label="Follow on Instagram" />
              )}
            </div>
          </div>

          {programmes.length > 0 && (
            <div>
              <h2 className="rail__title">Also in Documentaries</h2>
              {/* Not links: none of these is shot yet, so there is nothing to
                  open. The strand page carries the same caveat. */}
              {programmes.map((f) => (
                <div className="sidestory" key={f.slug}>
                  <span className="card__cat">{f.status}</span>
                  <span className="sidestory__title">{f.title}</span>
                  <span className="sidestory__meta">{f.standfirst}</span>
                </div>
              ))}
              <Link className="section__more" href="/documentaries" style={{ marginTop: 10 }}>
                All films →
              </Link>
            </div>
          )}

          {archive.length > 0 && (
            <div>
              <h2 className="rail__title">From the archive</h2>
              {/* Keyed on index, not slug: getArchive cycles, so slugs
                  repeat while the archive is shallower than the rail. */}
              {archive.map((a, i) => (
                <RankedItem article={a} n={i + 1} key={`${a.slug}-${i}`} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
