import type { Metadata } from 'next';
import Link from 'next/link';
import { getArticles, getCategories, formatShortDate, SITE } from '@/lib/content';

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
  const categories = getCategories();
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
            {/* No photograph supplied yet; a monogram stands in rather than a stock face. */}
            <div
              className="frame frame--portrait"
              aria-hidden="true"
              style={{ background: 'var(--navy)' }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '3.4rem',
                  color: 'var(--gold-light)',
                  letterSpacing: '0.04em'
                }}
              >
                AAD
              </span>
            </div>
            <ul className="factlist">
              <li>
                <span className="k">Role</span>
                <span>Patron, The Nile Explorer</span>
              </li>
              <li>
                <span className="k">Published</span>
                <span>
                  {byPatron.length} articles on this site
                </span>
              </li>
              <li>
                <span className="k">Subjects</span>
                <span>{categories.map((c) => c.name).join(', ')}</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="about__role">Patron &amp; contributing author</p>
            <h1 className="about__name" id="patron-heading">
              {SITE.patron}
            </h1>

            <div className="prose" style={{ marginTop: 'var(--space-4)', maxWidth: '64ch' }}>
              <p>
                Dr. Aldo Ajou Deng-Akuey is the patron of The Nile Explorer and the author of the
                essays published here. His writing addresses South Sudan’s transition from
                liberation movement to functioning state, the mediation efforts that shape the
                region, and Africa’s standing as competition between global powers sharpens again.
              </p>
              <p>
                The argument running through the work is consistent: that a vote settles who
                governs but not whether the institutions holding the result are trusted, and that
                the harder task is the one that begins after a settlement is signed.
              </p>
              <blockquote>
                We must shift from blame to responsibility, from suspicion to trust, from division
                to unity.
              </blockquote>
            </div>

            <div className="callout" style={{ marginTop: 'var(--space-5)' }}>
              <strong>Editorial note:</strong> the biography above is drawn only from the published
              articles and the existing site. The current nilexplorer.net About page contains
              placeholder text, so there is no full biography to import. Send the authorised
              biography, titles and a portrait photograph and this section will carry them.
            </div>
          </div>

          <aside className="about__aside rail" aria-label="At a glance">
            <div>
              <h2 className="rail__title">Latest from the patron</h2>
              {byPatron.slice(0, 4).map((a) => (
                <Link className="sidestory" href={`/articles/${a.slug}`} key={a.slug}>
                  <span className="card__cat">{a.category.name}</span>
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
                <span style={{ color: 'var(--muted)' }}> · {a.category.name}</span>
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
