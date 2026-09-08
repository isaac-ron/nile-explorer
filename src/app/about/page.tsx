import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getArticles, getTopics, formatShortDate, labelFor, SITE } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${SITE.name}, the Nile Explorer Podcast, and patron ${SITE.patron}.`
};

/* Recurring subjects, taken from the published articles rather than asserted. */
const THEMES = [
  {
    title: 'Continental unity',
    body: 'Africa’s position between competing powers, and why a common diplomatic front matters more than alignment with any single bloc.'
  },
  {
    title: 'From movement to state',
    body: 'The unfinished transition of the SPLM from liberation movement to governing party, and what democratic contestation demands of it.'
  },
  {
    title: 'Nationalism as practice',
    body: 'Nationalism argued as practical leverage and shared responsibility, not as slogan or ethnic claim.'
  },
  {
    title: 'Peace architecture',
    body: 'Mediation, security arrangements and the institutional work that has to hold once an agreement is signed.'
  }
];

export default function AboutPage() {
  const articles = getArticles();
  const topics = getTopics();
  const byPatron = articles.filter((a) => a.author === SITE.patron);

  return (
    <>
      {/* ---------- Patron ---------- */}
      <section className="section shell" aria-labelledby="patron-heading">
        <div className="kicker">
          <span className="kicker__cat">The patron</span>
          <span className="kicker__rule" />
          <span className="kicker__meta">Juba</span>
        </div>

        <div className="about__grid">
          <div className="about__portrait">
            <div className="frame frame--portrait">
              <Image
                src="/brand/patron.jpg"
                alt="Dr. Aldo Ajou Deng-Akuey, patron of The Nile Explorer, seated at a podcast microphone."
                width={1200}
                height={1500}
                sizes="(max-width: 1000px) 60vw, 290px"
                priority
              />
            </div>
            <p className="credit">Photograph by Daniel Athian</p>
            <ul className="factlist">
              <li>
                <span className="k">Role</span>
                <span>Patron &amp; contributing author</span>
              </li>
              <li>
                <span className="k">Published</span>
                <span>
                  {byPatron.length} articles on this site
                </span>
              </li>
              <li>
                <span className="k">Subjects</span>
                <span>{topics.map((t) => t.name).join(', ')}</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="about__role">Patron of The Nile Explorer</p>
            <h1 className="about__name" id="patron-heading">
              {SITE.patron}
            </h1>

            <div className="prose" style={{ marginTop: 'var(--space-4)', maxWidth: '64ch' }}>
              <p>
                Dr. Aldo Ajou Deng-Akuey has spent more than five decades at the centre of this
                story, not as an observer but as a participant. From Sudan&rsquo;s parliament to
                South Sudan&rsquo;s Council of States, he has been present in the rooms where peace
                was negotiated, where constitutions were debated, and where the architecture of a
                new nation was drawn in real time.
              </p>
              <p>
                He is a believer in the independence and self-determination of African states: in
                Africa&rsquo;s right to govern itself, to own its resources, to trade on its own
                terms, and to build institutions that answer to African citizens rather than
                external creditors. He stands with the government of South Sudan in its commitment
                to the peace process and the constitutional path forward, out of the conviction
                that stability and legitimate governance are the preconditions for everything else:
                economic justice, youth opportunity, and national unity.
              </p>
              <blockquote>
                The path forward cannot be the burden of the government alone, nor of political
                parties alone. It is a collective responsibility of all South Sudanese; leaders,
                opposition, communities, religious groups, women, youth, and civil society. We must
                shift from blame to responsibility, from suspicion to trust, from division to unity.
              </blockquote>
              <p>
                He is the patron of The Nile Explorer, bringing to it his credibility, his
                relationships and his institutional memory. The platform, though, is not about one
                man. It is about a continent: built for the people, owned by the people, speaking to
                and for the people.
              </p>
            </div>

            <div className="callout" style={{ marginTop: 'var(--space-5)' }}>
              <strong>Still needed:</strong> confirmation of the formal titles and honorifics to
              use alongside the name.
            </div>
          </div>

          <aside className="about__aside rail" aria-label="At a glance">
            <div>
              <h2 className="rail__title">Latest from the patron</h2>
              {byPatron.slice(0, 4).map((a) => (
                <Link className="sidestory" href={`/articles/${a.slug}`} key={a.slug}>
                  <span className="card__cat">{labelFor(a)}</span>
                  <span className="sidestory__title">{a.title}</span>
                  <span className="sidestory__meta">
                    {formatShortDate(a.date)} · {a.readingTime} min
                  </span>
                </Link>
              ))}
            </div>

            <div className="railcard">
              <p className="label label--muted">Get in touch</p>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 'var(--fs-small)',
                  color: 'var(--ink-blurb)',
                  lineHeight: 1.55
                }}
              >
                Pitches, corrections and rights of reply go to the newsroom directly.
              </p>
              <a
                className="btn"
                href={`mailto:${SITE.email}`}
                style={{ marginTop: 'var(--space-3)' }}
              >
                Email the newsroom
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- Themes ---------- */}
      <section className="section section--band" aria-labelledby="themes-heading">
        <div className="shell">
          <div className="section__head">
            <h2 id="themes-heading">Recurring subjects</h2>
            <Link className="section__more" href="/articles">
              Read the archive →
            </Link>
          </div>
          <div className="cardgrid">
            {THEMES.map((t) => (
              <div className="card" key={t.title}>
                <span className="card__title">{t.title}</span>
                <span className="card__blurb">{t.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Selected writing ---------- */}
      <section className="section shell" aria-labelledby="writing-heading">
        <div className="section__head">
          <h2 id="writing-heading">Selected writing</h2>
          <Link className="section__more" href="/articles">
            All {articles.length} articles →
          </Link>
        </div>
        <ul className="factlist" style={{ maxWidth: '90ch' }}>
          {byPatron.slice(0, 8).map((a) => (
            <li key={a.slug} style={{ gridTemplateColumns: 'minmax(0,110px) minmax(0,1fr)' }}>
              <span className="k">{formatShortDate(a.date)}</span>
              <span>
                <Link
                  href={`/articles/${a.slug}`}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.02rem',
                    color: 'var(--navy)'
                  }}
                >
                  {a.title}
                </Link>
                <span style={{ color: 'var(--muted)' }}> · {labelFor(a)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Publication + contact ---------- */}
      <section className="section section--band" aria-labelledby="pub-heading">
        <div className="shell withrail">
          <div>
            <div className="section__head">
              <h2 id="pub-heading">About the publication</h2>
            </div>
            <div className="prose" style={{ maxWidth: '64ch' }}>
              <p>
                The Nile Explorer is an independent media network reporting on peace, governance and
                geopolitics across South Sudan and the wider Nile basin. It publishes written
                analysis, produces The Nile Explorer Podcast, and carries video from the newsroom
                and the field.
              </p>
              <p>
                The masthead line, <em>The Mirror of Africa</em>, is meant literally: coverage of the
                region written from inside it, for readers who live with the consequences of what is
                reported.
              </p>
            </div>
          </div>

          <aside className="rail" aria-label="Contact">
            <div className="railcard">
              <h2 className="rail__title" style={{ borderBottom: 0, paddingBottom: 8 }}>
                Contact
              </h2>
              <ul className="factlist">
                <li>
                  <span className="k">Newsroom</span>
                  <span>
                    <a
                      href={`mailto:${SITE.email}`}
                      style={{
                        textDecoration: 'underline',
                        textDecorationColor: 'var(--gold)',
                        textUnderlineOffset: 3
                      }}
                    >
                      {SITE.email}
                    </a>
                  </span>
                </li>
                <li>
                  <span className="k">YouTube</span>
                  <span>
                    <a href={SITE.youtube} target="_blank" rel="noopener noreferrer">
                      @thenilexplorerpodcast
                    </a>
                  </span>
                </li>
                <li>
                  <span className="k">Instagram</span>
                  <span>
                    <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">
                      @thenilexplorer_podcast
                    </a>
                  </span>
                </li>
              </ul>
              <p
                style={{
                  marginTop: 'var(--space-3)',
                  fontSize: 'var(--fs-small)',
                  color: 'var(--muted)'
                }}
              >
                Corrections and rights of reply are published in full.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
