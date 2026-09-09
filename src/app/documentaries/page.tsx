import type { Metadata } from 'next';
import Link from 'next/link';
import { getDocumentaries, getArchive, getLatestEpisode, SITE } from '@/lib/content';
import { ProgrammeRow } from '@/components/Television';
import { RankedItem } from '@/components/Story';
import { PlatformLink } from '@/components/Icons';
import Empty from '@/components/Empty';

export const metadata: Metadata = {
  title: 'Documentaries',
  description:
    'Documentaries, specials and live streams from The Nile Explorer, broadcast on the network YouTube channel.'
};

export default function DocumentariesPage() {
  const programmes = getDocumentaries();
  const archive = getArchive(4);
  const episode = getLatestEpisode();

  return (
    <section className="section">
      <div className="shell withrail">
        <div>
          <div className="section__head">
            <h1 style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>Documentaries</h1>
            {programmes.length > 0 && (
              <span className="label label--muted">
                {programmes.length} {programmes.length === 1 ? 'film' : 'films'}
              </span>
            )}
          </div>

          <p
            style={{
              marginBottom: 'var(--space-5)',
              color: 'var(--ink-blurb)',
              maxWidth: '62ch'
            }}
          >
            Long-form films, specials and archive broadcasts from the network channel. The podcast is
            published separately, with an audio edition, on{' '}
            <Link
              href="/podcasts"
              style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              the podcast page
            </Link>
            .
          </p>

          {programmes.length > 0 ? (
            <div>
              {programmes.map((v) => (
                <ProgrammeRow video={v} key={v.videoId} />
              ))}
            </div>
          ) : (
            <Empty
              title="No documentaries published yet"
              body="The first films are in production. They will appear here as they are broadcast on the network channel."
              action={{ href: SITE.youtube, label: 'Subscribe on YouTube', external: true }}
            />
          )}
        </div>

        <aside className="rail" aria-label="Elsewhere on the network">
          <div className="railcard">
            <p className="label label--muted">The channel</p>
            <p
              style={{
                marginTop: 8,
                fontSize: 'var(--fs-small)',
                color: 'var(--ink-blurb)',
                lineHeight: 1.55
              }}
            >
              Everything here is broadcast on the network YouTube channel. Subscribe there for live
              streams as they happen.
            </p>
            <div className="platforms" style={{ marginTop: 'var(--space-3)' }}>
              <PlatformLink name="youtube" href={SITE.youtube} label="Subscribe on YouTube" />
              <PlatformLink name="instagram" href={SITE.instagram} label="Follow on Instagram" />
            </div>
          </div>

          {episode && (
            <div className="railcard">
              <p className="label label--muted">The podcast</p>
              <p
                style={{
                  marginTop: 8,
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.02rem',
                  lineHeight: 1.25,
                  color: 'var(--navy)'
                }}
              >
                {episode.title}
              </p>
              <Link className="section__more" href="/podcasts" style={{ marginTop: 10 }}>
                Watch or listen →
              </Link>
            </div>
          )}

          {archive.length > 0 && (
            <div>
              <h2 className="rail__title">From the archive</h2>
              {/* Keyed by index: getArchive cycles, so slugs repeat. */}
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
