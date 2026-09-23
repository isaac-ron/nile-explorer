import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWriter, getWriters, getArticlesByWriter, getSite, labelFor } from '@/lib/content';
import { StoryRow } from '@/components/Story';
import Prose from '@/components/Prose';

export async function generateStaticParams() {
  return (await getWriters()).map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [writer, site] = await Promise.all([getWriter(slug), getSite()]);
  if (!writer) return {};
  const description =
    writer.colophon ?? `${writer.count} ${writer.count === 1 ? 'piece' : 'pieces'} for ${site.name}.`;
  return {
    title: writer.name,
    description,
    openGraph: {
      title: writer.name,
      description,
      type: 'profile',
      images: writer.portrait ? [writer.portrait.url] : undefined
    }
  };
}

/**
 * A writer's page: who they are, then everything they have filed.
 *
 * The biography is the Studio's Biography field and the line under the name is
 * their Role. With neither filled in, the page falls back to the note printed
 * at the foot of their articles, so a writer added in a hurry still gets a
 * page that says something about them rather than a bare list.
 */
export default async function WriterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const writer = await getWriter(slug);
  if (!writer) notFound();

  const articles = await getArticlesByWriter(writer.slug);
  const subjects = [...new Set(articles.map(labelFor))];

  return (
    <>
      <section className="section shell" aria-labelledby="writer-heading">
        <div className={`writer${writer.portrait ? '' : ' writer--noportrait'}`}>
          {writer.portrait && (
            <div className="writer__portrait">
              <span className="frame frame--portrait">
                <Image
                  src={writer.portrait.url}
                  alt={writer.portrait.alt || `Portrait of ${writer.name}`}
                  width={writer.portrait.width ?? 1200}
                  height={writer.portrait.height ?? 1500}
                  sizes="(max-width: 700px) 50vw, 240px"
                  preload
                />
              </span>
              {writer.portrait.credit && <p className="credit">{writer.portrait.credit}</p>}
            </div>
          )}

          <div className="writer__body">
            <div className="kicker">
              <Link className="kicker__cat" href="/writers">
                Writers
              </Link>
              <span className="kicker__rule" />
            </div>
            <h1 className="about__name" id="writer-heading">
              {writer.name}
            </h1>
            {writer.role && <p className="about__role">{writer.role}</p>}

            {writer.bio.length > 0 ? (
              <Prose value={writer.bio} />
            ) : (
              writer.colophon && <p className="writer__colophon">{writer.colophon}</p>
            )}

            <ul className="factlist writer__facts">
              <li>
                <span className="k">Published</span>
                <span>
                  {articles.length} {articles.length === 1 ? 'piece' : 'pieces'}
                </span>
              </li>
              {subjects.length > 0 && (
                <li>
                  <span className="k">Writes on</span>
                  <span>{subjects.join(', ')}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section--band" aria-labelledby="writer-articles-heading">
        <div className="shell">
          <div className="section__head">
            <h2 id="writer-articles-heading">By {writer.name}</h2>
            <Link className="section__more" href="/writers">
              All writers →
            </Link>
          </div>
          <div className="river writer__river">
            {articles.map((a) => (
              <StoryRow article={a} key={a.slug} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
