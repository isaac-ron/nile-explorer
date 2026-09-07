import type { Metadata } from 'next';
import Link from 'next/link';
import { getTelevision, getArchive, getLatestEpisode, SITE } from '@/lib/content';
import { ProgrammeRow } from '@/components/Television';
import { RankedItem } from '@/components/Story';
import { PlatformLink } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Television',
  description:
    'Programmes, specials and live streams from The Nile Explorer, broadcast on the network YouTube channel.'
};

export default function TelevisionPage() {
  const programmes = getTelevision();
  const archive = getArchive(4);
  const episode = getLatestEpisode();

  return (
    <section className="section">
      <div className="shell withrail">
        <div>
          <div className="section__head">
            <h1 style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>Television</h1>
            <span className="label label--muted">{programmes.length} programmes</span>
          </div>

          <p
            style={{
              marginBottom: 'var(--space-5)',
              color: 'var(--ink-blurb)',
              maxWidth: '62ch'
            }}
          >
            Specials, live streams and archive broadcasts from the network channel. The podcast is
            published separately, with an audio edition, on{' '}
            <Link
              href="/podcasts"
              style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              the podcast page
            </Link>
            .
          </p>

          <div>
            {programmes.map((v) => (
              <ProgrammeRow video={v} key={v.videoId} />
            ))}
          </div>
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
