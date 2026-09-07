import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getEpisodes, getArticles, formatDate, SITE } from '@/lib/content';
import { RankedItem } from '@/components/Story';

export const metadata: Metadata = {
  title: 'The Nile Explorer Podcast',
  description:
    'Conversations on peace, governance and the future of South Sudan and the Nile basin.'
};

const PLATFORMS = [
  {
    label: 'Watch on YouTube',
    href: SITE.youtube,
    svg: (
      <>
        <rect x="2.4" y="5.6" width="19.2" height="12.8" rx="3.4" />
        <path d="M10.4 9.4l4.8 2.6-4.8 2.6z" fill="currentColor" stroke="none" />
      </>
    )
  },
  {
    label: 'Follow on Instagram',
    href: SITE.instagram,
    svg: (
      <>
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </>
    )
  }
];

export default function PodcastsPage() {
  const episodes = getEpisodes();
  const [latest, ...older] = episodes;
  const mostRead = getArticles().slice(0, 5);

  return (
    <section className="section">
      <div className="shell withrail">
        <div>
          <div className="section__head">
            <h1 style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>
              The Nile Explorer Podcast
            </h1>
            <span className="label label--muted">{episodes.length} episodes</span>
          </div>

          {latest && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="embed">
                <iframe
                  src={latest.embed}
                  title={latest.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <p className="card__cat" style={{ marginTop: 'var(--space-3)' }}>
                Latest · Episode {latest.number}
              </p>
              <h2
                style={{
                  fontSize: 'var(--fs-h3)',
                  color: 'var(--navy)',
                  marginTop: 6,
                  maxWidth: '34ch'
                }}
              >
                {latest.title}
              </h2>
              <p className="episode__desc" style={{ marginTop: 8 }}>
                {latest.summary || 'A conversation from the Nile Explorer newsroom.'}
              </p>
              <div className="platforms" style={{ marginTop: 'var(--space-4)' }}>
                <span className="label label--muted">Listen on</span>
                {PLATFORMS.map((p) => (
                  <a
                    className="platform"
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={p.label}
                    title={p.label}
                    key={p.label}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      {p.svg}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="section__head">
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
                  <Image
                    src={e.thumbnail}
                    alt=""
                    width={1280}
                    height={720}
                    sizes="(max-width: 700px) 100vw, 200px"
                  />
                  <span className="playbadge" aria-hidden="true">
                    <span>▶</span>
                  </span>
                </span>
                <span className="episode__body">
                  <span className="card__cat">Episode {e.number}</span>
                  <span className="episode__title">{e.title}</span>
                  {e.summary && <span className="episode__desc">{e.summary}</span>}
                  <span className="card__meta">{formatDate(e.published)}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <aside className="rail" aria-label="Podcast and reading">
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
              Conversations on peace, governance and the future of the Nile basin, recorded in Juba
              and streamed on YouTube.
            </p>
          </div>

          <div>
            <h2 className="rail__title">From the newsroom</h2>
            {mostRead.map((a, i) => (
              <RankedItem article={a} n={i + 1} key={a.slug} />
            ))}
          </div>

          <div className="railcard">
            <p className="label label--muted">Instagram</p>
            <p
              style={{
                marginTop: 8,
                fontSize: 'var(--fs-small)',
                color: 'var(--ink-blurb)',
                lineHeight: 1.55
              }}
            >
              Clips and stills from recording days.
            </p>
            <Link
              className="section__more"
              href={SITE.instagram}
              style={{ marginTop: 10, borderBottomColor: 'var(--gold)' }}
            >
              Follow →
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
