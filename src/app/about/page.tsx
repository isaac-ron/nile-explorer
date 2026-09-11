import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getArticles, getTopics, formatShortDate, labelFor, SITE } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About',
  description:
    'A multimedia platform delivering conversations and opinion on peace, democracy, governance and nation building from South Sudan and across Africa.'
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
      {/* ---------- The platform ----------
          Copy supplied by the newsroom. It leads the page because that is the
          order the supplied document puts it in: what this is, then who founded
          it. The only change to the text is a missing space after a full stop
          and the split into two paragraphs; not a word has been altered. */}
      <section className="section shell" aria-labelledby="about-heading">
        <div className="kicker">
          <span className="kicker__cat">About</span>
          <span className="kicker__rule" />
          <span className="kicker__meta">{SITE.tagline}</span>
        </div>

        <h1 className="about__name" id="about-heading" style={{ marginBottom: 'var(--space-4)' }}>
          About {SITE.name}
        </h1>

        <div className="prose" style={{ maxWidth: '68ch' }}>
          <p>
            {SITE.name} is a multimedia platform delivering conversations and opinion on peace,
            democracy, governance and nation building from South Sudan and across Africa. Through
            podcast, television broadcast, print and social media, we document and amplify the
            voices, stories and ideas shaping peace, security and governance across South Sudan,
            the East African region, the Nile basin and the wider African continent.
          </p>
          <p>
            {SITE.name} operates on a single governing conviction: that every voice carries weight
            in the making of a peaceful and sovereign Africa. The statesman and the
            constitutionalist, woman leader and the peacebuilder. The young person inheriting
            today&rsquo;s decisions, and the child whose future depends on whether those decisions
            are made well. None is dispensable to the account we build.
          </p>
          <p>
            Our work is carried out by a team of journalists, human rights advocates and academics
            drawn from across Africa, the UK and the United States, operating from London, Nairobi
            and South Sudan, three vantage points chosen deliberately for what they allow us to see
            and report with authority.
          </p>
        </div>
      </section>

      {/* ---------- Founder ---------- */}
      <section className="section section--band" aria-labelledby="patron-heading">
        <div className="shell">

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
                <span>Founder, Patron &amp; Lead Curator</span>
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
            <p className="about__role">Founder, Patron and Lead Curator</p>
            <h2 className="about__name" id="patron-heading">
              {SITE.patron}
            </h2>

            <div className="prose" style={{ marginTop: 'var(--space-4)', maxWidth: '64ch' }}>
              <p>
                {SITE.name} is founded, patronised and curated by {SITE.patron}, a veteran South
                Sudanese statesman and former senior government officer whose public life spans more
                than five decades of the region&rsquo;s political transformation.
              </p>
              <p>
                Dr. Deng-Akuey&rsquo;s career has run through the institutions that defined
                Sudan&rsquo;s and South Sudan&rsquo;s modern political trajectory, from
                Sudan&rsquo;s parliament to South Sudan&rsquo;s Council of States. His has not been
                a career of commentary from the margins but of direct participation in the
                country&rsquo;s constitutional and peacebuilding processes, present in the
                negotiations that shaped successive peace settlements, in the deliberations that
                produced South Sudan&rsquo;s constitutional architecture, and in the institutional
                work of nation building that followed independence. His political philosophy is
                rooted in a firm commitment to African sovereignty and self-determination: the
                principle that African states hold the right to govern themselves, to control and
                benefit from their own natural resources, to set the terms of their own trade
                relationships, and to build institutions of accountability that answer first to
                their own citizens rather than to external creditors or foreign interests. He has
                aligned himself publicly with the government of South Sudan&rsquo;s commitment to
                the peace process and the constitutional path forward, on the premise that durable
                stability and legitimate governance are the foundational preconditions for economic
                justice, youth opportunity and national cohesion, rather than outcomes that can be
                achieved independently of them.
              </p>
              <blockquote>
                The path forward cannot be the burden of the government alone, nor of political
                parties alone. It is a collective responsibility of all South Sudanese; leaders,
                opposition, communities, religious groups, women, youth, and civil society. We must
                shift from blame to responsibility, from suspicion to trust, from division to unity.
              </blockquote>
              <p>
                It is from this same political conviction that {SITE.name} draws its mandate. Dr.
                Deng-Akuey holds a considered view of media not as a passive chronicler of events
                but as an instrument of nation building in its own right, capable of shaping the
                terms on which peace and governance are debated and ultimately determined, rather
                than merely reporting on them after the fact. His broader vision, one of African
                sovereignty, self-determination and the economic empowerment of African people, is
                intended to reach citizens, diplomats and policymakers across the continent and its
                global diaspora.
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
        </div>
      </section>

      {/* ---------- Themes ---------- */}
      <section className="section shell" aria-labelledby="themes-heading">
        <div>
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

      {/* ---------- What it is for + contact ---------- */}
      <section className="section" aria-labelledby="pub-heading">
        <div className="shell withrail">
          <div>
            <div className="section__head">
              <h2 id="pub-heading">What it is for</h2>
            </div>
            <div className="prose" style={{ maxWidth: '64ch' }}>
              <p>
                {SITE.name} exists to widen the conversation on the issues shaping South Sudan and
                Africa&rsquo;s future, from peace and security to governance and the long, unfinished
                work of nation building.
              </p>
              <p>
                The masthead line, <em>{SITE.tagline}</em>, is meant literally: coverage of the
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
