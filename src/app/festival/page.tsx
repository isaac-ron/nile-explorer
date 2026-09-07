import type { Metadata } from 'next';
import Link from 'next/link';
import { getFestival, getArchive, SITE } from '@/lib/content';
import { RankedItem } from '@/components/Story';
import { PlatformLink } from '@/components/Icons';

const festival = getFestival();

export const metadata: Metadata = {
  title: festival.name,
  description: `${festival.standfirst} ${festival.blurb}`
};

export default function FestivalPage() {
  const archive = getArchive(4);

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
              <p>
                The festival is also the platform&rsquo;s sustainability engine. Alongside it sits
                the foundation, which carries the Nile Explorer Scholarships, the Nile Festival
                Awards and the Nile Explorer Academy, so that the newsroom and the training pipeline
                are funded from something the public actually turns up to rather than from
                donor cycles.
              </p>
            </div>

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

            <div className="section__head" style={{ marginTop: 'var(--space-6)' }}>
              <h2>{festival.awards.name}</h2>
            </div>
            <div className="prose" style={{ maxWidth: '64ch' }}>
              <p>{festival.awards.detail}</p>
            </div>
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
              <a className="btn" href={`mailto:${SITE.email}`} style={{ marginTop: 'var(--space-3)' }}>
                Register interest
              </a>
            </div>

            <div className="railcard">
              <p className="label label--muted">Follow the build-up</p>
              <div className="platforms" style={{ marginTop: 'var(--space-3)' }}>
                <PlatformLink name="instagram" href={SITE.instagram} label="Follow on Instagram" />
                <PlatformLink name="youtube" href={SITE.youtube} label="Subscribe on YouTube" />
              </div>
            </div>

            <div>
              <h2 className="rail__title">From the newsroom</h2>
              {archive.map((a, i) => (
                <RankedItem article={a} n={i + 1} key={a.slug} />
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section section--band shell">
        <div className="callout">
          <strong>Editorial note:</strong> this page describes the festival as set out in the
          communications strategy. Dates, venues, the programme and ticketing are not yet confirmed
          and nothing on this page should be read as a published schedule.
        </div>
      </section>
    </>
  );
}
