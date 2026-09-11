import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getArticle,
  getArticleSlugs,
  getRelated,
  getLatestEpisode,
  getSite,
  formatDate,
  labelFor
} from '@/lib/content';
import { RankedItem } from '@/components/Story';
import { PlatformLink } from '@/components/Icons';
import Prose from '@/components/Prose';

export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author.name],
      images: article.image ? [article.image.url] : undefined
    }
  };
}

const SHARE = (url: string, title: string) => [
  {
    icon: 'x' as const,
    label: 'Share this article on X',
    href: `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    icon: 'whatsapp' as const,
    label: 'Share this article on WhatsApp',
    href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
  },
  {
    icon: 'facebook' as const,
    label: 'Share this article on Facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  }
];

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [related, episode, site] = await Promise.all([
    getRelated(article, 4),
    getLatestEpisode(),
    getSite()
  ]);
  const relatedItems = related.articles;
  const url = `${site.url}/articles/${article.slug}`;

  return (
    <>
      <article className="section shell">
        <div className="withrail">
          <div>
            <div className="article__head">
              <div className="kicker">
                {article.topic ? (
                  <Link className="kicker__cat" href={`/articles?topic=${article.topic.slug}`}>
                    {article.topic.name}
                  </Link>
                ) : (
                  <span className="kicker__cat">{article.section}</span>
                )}
                <span className="kicker__rule" />
                {/* The dateline is per-article now. It used to say Juba on
                    everything, which asserted a filing location for pieces
                    that had none. */}
                {article.dateline && <span className="kicker__meta">{article.dateline}</span>}
              </div>

              <h1 className="article__title">{article.title}</h1>
              <p className="article__deck">{article.summary}</p>

              <div className="byline">
                <span className="byline__author">By {article.author.name}</span>
                <span>{formatDate(article.date)}</span>
                <span>{article.readingTime} min read</span>
                <span className="share">
                  {SHARE(url, article.title).map((s) => (
                    <PlatformLink name={s.icon} href={s.href} label={s.label} key={s.icon} />
                  ))}
                </span>
              </div>
            </div>

            {article.image && (
              <figure style={{ margin: 'var(--space-5) 0' }}>
                <span className="frame frame--lede">
                  <Image
                    src={article.image.url}
                    /* Fallback for the archive pieces imported from
                       WordPress, which arrived with empty alt attributes.
                       The CMS requires a description on anything new. */
                    alt={article.image.alt || `Illustration for “${article.title}”`}
                    width={article.image.width ?? 1200}
                    height={article.image.height ?? 768}
                    sizes="(max-width: 1000px) 100vw, 860px"
                    preload
                  />
                </span>
                {article.image.credit && <figcaption>{article.image.credit}</figcaption>}
              </figure>
            )}

            <Prose value={article.body} />

            <div className="colophon">
              {article.author.colophon ? `${article.author.colophon} ` : ''}
              Corrections and rights of reply:{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
          </div>

          <aside className="rail" aria-label="Related coverage">
            <div>
              <h2 className="rail__title">{related.heading}</h2>
              {relatedItems.map((a, i) => (
                <RankedItem article={a} n={i + 1} key={a.slug} />
              ))}
            </div>

            {episode && (
              <div className="railcard">
                <p className="label label--muted">Listen</p>
                <Image
                  src="/brand/podcast-logo.png"
                  alt="The Nile Explorer Podcast"
                  width={1729}
                  height={1660}
                  style={{ width: '100%', maxWidth: 160, height: 'auto', margin: '10px 0 12px' }}
                />
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.02rem',
                    lineHeight: 1.25,
                    color: 'var(--navy)'
                  }}
                >
                  {episode.title}
                </p>
                <Link className="section__more" href="/podcasts" style={{ marginTop: 10 }}>
                  Play episode →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </article>

      <section className="section section--band" aria-labelledby="more-heading">
        <div className="shell">
          <div className="section__head">
            <h2 id="more-heading">More from The Nile Explorer</h2>
            <Link className="section__more" href="/articles">
              All articles →
            </Link>
          </div>
          <div className="cardgrid">
            {relatedItems.map((a) => (
              <Link className="card" href={`/articles/${a.slug}`} key={a.slug}>
                {a.image && (
                  <span className="frame frame--card">
                    <Image
                      src={a.image.url}
                      alt=""
                      width={a.image.width ?? 1200}
                      height={a.image.height ?? 800}
                      sizes="(max-width: 700px) 100vw, 300px"
                    />
                  </span>
                )}
                <span className="card__cat">{labelFor(a)}</span>
                <span className="card__title">{a.title}</span>
                <span className="card__blurb">{a.summary}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
