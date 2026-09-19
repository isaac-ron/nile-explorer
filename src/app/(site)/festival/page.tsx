import type { Metadata } from 'next';
import { getFestival, getArchive, getSite } from '@/lib/content';
import { RankedItem } from '@/components/Story';
import { PlatformLink } from '@/components/Icons';
import Prose from '@/components/Prose';

export async function generateMetadata(): Promise<Metadata> {
  const festival = await getFestival();
  return {
    title: festival.name,
    description: `${festival.standfirst} ${festival.blurb}`.trim()
  };
}

export default async function FestivalPage() {
  const [festival, archive, site] = await Promise.all([getFestival(), getArchive(4), getSite()]);

  return (
    <>
      <section className="fest on-navy" aria-labelledby="fest-heading">
        <div className="fest__scrim" />
        <div className="fest__inner shell">
          <span className="fest__kicker">
            {festival.datesAnnounced && festival.dates
              ? festival.dates
              : 'Inaugural edition · Dates to be announced'}
          </span>
          <h1 className="fest__title" id="fest-heading">
            {festival.name}
          </h1>
          <p className="fest__blurb">{festival.standfirst}</p>
        </div>
      </section>

      <section className="section shell" aria-labelledby="what-heading">
        <div className="withrail">
          <div>
            <div className="section__head">
              <h2 id="what-heading">What it is</h2>
            </div>
            <div className="prose" style={{ maxWidth: '64ch' }}>
              <p>{festival.blurb}</p>
            </div>
            {/* The foundation, the scholarships, the awards and the academy.
                Edited in the Studio so nothing here asserts a programme that
                has not been established. */}
            <Prose value={festival.foundationBody} />

            {festival.strands.length > 0 && (
              <>
                <div className="section__head" style={{ marginTop: 'var(--space-6)' }}>
                  <h2>The strands</h2>
                </div>
                <div className="cardgrid">
                  {festival.strands.map((s) => (
                    <div className="card" key={s.name}>
                      <span className="card__title">{s.name}</span>
                      <span className="card__blurb">{s.detail}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {festival.awards && (
              <>
                <div className="section__head" style={{ marginTop: 'var(--space-6)' }}>
                  <h2>{festival.awards.name}</h2>
                </div>
                <div className="prose" style={{ maxWidth: '64ch' }}>
                  <p>{festival.awards.detail}</p>
                </div>
              </>
            )}
          </div>

          <aside className="rail" aria-label="Festival details">
            <div className="railcard">
              <p className="label label--muted">Programme</p>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 'var(--fs-small)',
                  color: 'var(--ink-blurb)',
                  lineHeight: 1.55
                }}
              >
                {festival.datesAnnounced && festival.dates
                  ? `The inaugural edition runs ${festival.dates}. Full programme to follow.`
                  : 'Dates for the inaugural edition have not been announced. The programme, venues and ticketing will be published here once they are confirmed.'}
              </p>
              {site.email && (
                <a
                  className="btn"
                  href={`mailto:${site.email}`}
                  style={{ marginTop: 'var(--space-3)' }}
                >
                  Register interest
                </a>
              )}
            </div>

            <div className="railcard">
              <p className="label label--muted">Follow the build-up</p>
              <div className="platforms" style={{ marginTop: 'var(--space-3)' }}>
                {site.instagram && (
                  <PlatformLink
                    name="instagram"
                    href={site.instagram}
                    label="Follow on Instagram"
                  />
                )}
                {site.youtube && (
                  <PlatformLink name="youtube" href={site.youtube} label="Subscribe on YouTube" />
                )}
              </div>
            </div>

            {archive.length > 0 && (
              <div>
                <h2 className="rail__title">From the newsroom</h2>
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

      {/* Shown to readers while anything on this page is still provisional.
          Clearing the field in the Studio removes the box. */}
      {festival.editorialNote && (
        <section className="section section--band shell">
          <div className="callout">
            <strong>Editorial note:</strong> {festival.editorialNote}
          </div>
        </section>
      )}
    </>
  );
}
