import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  getAboutPage,
  getArticles,
  getTopics,
  getSite,
  formatShortDate,
  labelFor,
  writerHref
} from '@/lib/content';
import Prose from '@/components/Prose';

export async function generateMetadata(): Promise<Metadata> {
  const [site, about] = await Promise.all([getSite(), getAboutPage()]);
  const patron = about.patron?.name ?? site.patron?.name;
  return {
    title: 'About',
    description: patron
      ? `About ${site.name}, the podcast, and patron ${patron}.`
      : `About ${site.name}.`
  };
}

export default async function AboutPage() {
  const [about, articles, topics, site] = await Promise.all([
    getAboutPage(),
    getArticles(),
    getTopics(),
    getSite()
  ]);

  const patron = about.patron;
  // Filtered on the writer record rather than by matching a name string, so a
  // change of honorific in the Studio cannot silently empty this list.
  const byPatron = patron ? articles.filter((a) => a.author.isPatron) : [];

  return (
    <>
      {/* ---------- The platform ----------
          Copy supplied by the newsroom. It leads the page because that is the
          order the supplied document puts it in: what this is, then who
          founded it. Held in Site settings → About page → Introduction rather
          than here, so the newsroom can revise it without a developer. */}
      {about.intro.length > 0 && (
        <section className="section shell" aria-labelledby="about-heading">
          <div className="kicker">
            <span className="kicker__cat">About</span>
            <span className="kicker__rule" />
            <span className="kicker__meta">{site.tagline}</span>
          </div>

          <h1
            className="about__name"
            id="about-heading"
            style={{ marginBottom: 'var(--space-4)' }}
          >
            About {site.name}
          </h1>

          <Prose value={about.intro} />
        </section>
      )}

      {/* ---------- Founder ---------- */}
      {patron && (
        <section className="section section--band" aria-labelledby="patron-heading">
          {/* The band runs full-bleed, so its contents need their own shell.
              On the previous plain section the section carried it. */}
          <div className="shell">
            <div className="kicker">
              <span className="kicker__cat">{about.patronKicker ?? 'The patron'}</span>
              <span className="kicker__rule" />
              <span className="kicker__meta"> </span>
            </div>

            <div className="about__grid">
            <div className="about__portrait">
              {patron.portrait && (
                <>
                  <div className="frame frame--portrait">
                    <Image
                      src={patron.portrait.url}
                      alt={patron.portrait.alt}
                      width={patron.portrait.width ?? 1200}
                      height={patron.portrait.height ?? 1500}
                      sizes="(max-width: 1000px) 60vw, 290px"
                      preload
                    />
                  </div>
                  {patron.portrait.credit && <p className="credit">{patron.portrait.credit}</p>}
                </>
              )}
              <ul className="factlist">
                {patron.role && (
                  <li>
                    <span className="k">Role</span>
                    <span>{patron.role}</span>
                  </li>
                )}
                <li>
                  <span className="k">Published</span>
                  <span>
                    {byPatron.length} {byPatron.length === 1 ? 'article' : 'articles'} on this site
                  </span>
                </li>
                {topics.length > 0 && (
                  <li>
                    <span className="k">Subjects</span>
                    <span>{topics.map((t) => t.name).join(', ')}</span>
                  </li>
                )}
              </ul>
            </div>

            <div>
              {about.patronRole && <p className="about__role">{about.patronRole}</p>}
              {/* h2, not h1: the platform section above it opens the page.
                  Falls back to h1 only when that section is empty, so the
                  document always has exactly one top-level heading. */}
              {about.intro.length > 0 ? (
                <h2 className="about__name" id="patron-heading">
                  {patron.name}
                </h2>
              ) : (
                <h1 className="about__name" id="patron-heading">
                  {patron.name}
                </h1>
              )}

              <Prose value={patron.bio} />

              {/* Shown to readers while something about this page is still
                  unconfirmed. Clearing the field in the Studio removes it. */}
              {about.editorialNote && (
                <div className="callout" style={{ marginTop: 'var(--space-5)' }}>
                  {about.editorialNote}
                </div>
              )}
            </div>

            <aside className="about__aside rail" aria-label="At a glance">
              {byPatron.length > 0 && (
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
                  <Link
                    className="section__more"
                    href={writerHref(patron)}
                    style={{ marginTop: 'var(--space-3)' }}
                  >
                    All {byPatron.length} pieces →
                  </Link>
                </div>
              )}

              <div className="railcard">
                <p className="label label--muted">Get in touch</p>
                {about.contactBlurb && (
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 'var(--fs-small)',
                      color: 'var(--ink-blurb)',
                      lineHeight: 1.55
                    }}
                  >
                    {about.contactBlurb}
                  </p>
                )}
                {site.email && (
                  <a
                    className="btn"
                    href={`mailto:${site.email}`}
                    style={{ marginTop: 'var(--space-3)' }}
                  >
                    Email the newsroom
                  </a>
                )}
              </div>
            </aside>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Recurring subjects ---------- */}
      {about.themes.length > 0 && (
        <section className="section shell" aria-labelledby="themes-heading">
          <div>
            <div className="section__head">
              <h2 id="themes-heading">{about.themesHeading ?? 'Recurring subjects'}</h2>
              <Link className="section__more" href="/articles">
                Read the archive →
              </Link>
            </div>
            <div className="cardgrid">
              {about.themes.map((t) => (
                <div className="card" key={t.name}>
                  <span className="card__title">{t.name}</span>
                  <span className="card__blurb">{t.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Selected writing ---------- */}
      {byPatron.length > 0 && (
        <section className="section section--band" aria-labelledby="writing-heading">
          <div className="shell">
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
          </div>
        </section>
      )}

      {/* ---------- Publication + contact ----------
          Both halves collapse when empty: a heading with nothing under it
          reads as a page that failed to load rather than one with nothing to
          say yet. */}
      {(about.publicationBody.length > 0 || site.email || site.youtube || site.instagram) && (
        <section className="section" aria-labelledby="pub-heading">
          <div className="shell withrail">
            <div>
              {about.publicationBody.length > 0 && (
                <>
                  <div className="section__head">
                    <h2 id="pub-heading">{about.publicationHeading ?? 'About the publication'}</h2>
                  </div>
                  <Prose value={about.publicationBody} />
                </>
              )}
            </div>

            {(site.email || site.youtube || site.instagram) && (
              <aside className="rail" aria-label="Contact">
                <div className="railcard">
                  <h2 className="rail__title" style={{ borderBottom: 0, paddingBottom: 8 }}>
                    Contact
                  </h2>
                  <ul className="factlist">
                    {site.email && (
                      <li>
                        <span className="k">Newsroom</span>
                        <span>
                          <a
                            href={`mailto:${site.email}`}
                            style={{
                              textDecoration: 'underline',
                              textDecorationColor: 'var(--gold)',
                              textUnderlineOffset: 3
                            }}
                          >
                            {site.email}
                          </a>
                        </span>
                      </li>
                    )}
                    {site.youtube && (
                      <li>
                        <span className="k">YouTube</span>
                        <span>
                          <a href={site.youtube} target="_blank" rel="noopener noreferrer">
                            {site.youtubeHandle ?? 'YouTube'}
                          </a>
                        </span>
                      </li>
                    )}
                    {site.instagram && (
                      <li>
                        <span className="k">Instagram</span>
                        <span>
                          <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                            {site.instagramHandle ?? 'Instagram'}
                          </a>
                        </span>
                      </li>
                    )}
                  </ul>
                  {about.correctionsNote && (
                    <p
                      style={{
                        marginTop: 'var(--space-3)',
                        fontSize: 'var(--fs-small)',
                        color: 'var(--muted)'
                      }}
                    >
                      {about.correctionsNote}
                    </p>
                  )}
                </div>
              </aside>
            )}
          </div>
        </section>
      )}
    </>
  );
}
