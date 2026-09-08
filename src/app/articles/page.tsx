import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getArticles,
  getTopics,
  getArticlesByTopic,
  getArticlesBySection,
  getArchive,
  SITE
} from '@/lib/content';
import { StoryRow, RankedItem } from '@/components/Story';

export const metadata: Metadata = {
  title: 'Articles',
  description: SITE.description
};

export default async function ArticlesPage({
  searchParams
}: {
  searchParams: Promise<{ topic?: string; section?: string }>;
}) {
  const { topic, section } = await searchParams;
  const topics = getTopics();
  const active = topics.find((t) => t.slug === topic);
  const articles = active
    ? getArticlesByTopic(active.slug)
    : section
      ? getArticlesBySection(section)
      : getArticles();
  const heading = active
    ? active.name
    : section
      ? section.charAt(0).toUpperCase() + section.slice(1)
      : 'News & Opinion';
  const archive = getArchive(4);

  return (
    <section className="section">
      <div className="shell withrail">
        <div>
          <div className="section__head">
            <h1 style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>
              {heading}
            </h1>
            <span className="label label--muted">
              {articles.length} {articles.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          <div className="chips" style={{ marginBottom: 'var(--space-5)' }}>
            <Link
              className="chip"
              href="/articles"
              aria-current={!active ? 'page' : undefined}
            >
              All
              <span className="chip__n">{getArticles().length}</span>
            </Link>
            {topics.map((t) => (
              <Link
                className="chip"
                href={`/articles?topic=${t.slug}`}
                aria-current={active?.slug === t.slug ? 'page' : undefined}
                key={t.slug}
              >
                {t.name}
                <span className="chip__n">{t.count}</span>
              </Link>
            ))}
          </div>

          <div className="river">
            {articles.map((a) => (
              <StoryRow article={a} key={a.slug} />
            ))}
          </div>
        </div>

        <aside className="rail" aria-label="From the archive">
          <div>
            <h2 className="rail__title">From the archive</h2>
            {archive.map((a, i) => (
              <RankedItem article={a} n={i + 1} key={a.slug} />
            ))}
          </div>

          <div className="railcard">
            <p className="label label--muted">About the desk</p>
            <p style={{ marginTop: 8, fontSize: 'var(--fs-small)', color: 'var(--ink-blurb)', lineHeight: 1.55 }}>
              Reporting and analysis on peace, governance and geopolitics across South Sudan and the
              wider Nile basin.
            </p>
            <Link className="section__more" href="/about" style={{ marginTop: 10 }}>
              About us →
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
