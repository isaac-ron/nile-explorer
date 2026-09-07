import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getArticles,
  getCategories,
  getArticlesByCategory,
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
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = getCategories();
  const active = categories.find((c) => c.slug === category);
  const articles = active ? getArticlesByCategory(active.slug) : getArticles();
  const mostRead = getArticles().slice(0, 5);

  return (
    <section className="section">
      <div className="shell withrail">
        <div>
          <div className="section__head">
            <h1 style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>
              {active ? active.name : 'All articles'}
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
            {categories.map((c) => (
              <Link
                className="chip"
                href={`/articles?category=${c.slug}`}
                aria-current={active?.slug === c.slug ? 'page' : undefined}
                key={c.slug}
              >
                {c.name}
                <span className="chip__n">{c.count}</span>
              </Link>
            ))}
          </div>

          <div className="river">
            {articles.map((a) => (
              <StoryRow article={a} key={a.slug} />
            ))}
          </div>
        </div>

        <aside className="rail" aria-label="Most read">
          <div>
            <h2 className="rail__title">Most read</h2>
            {mostRead.map((a, i) => (
              <RankedItem article={a} n={i + 1} key={a.slug} />
            ))}
          </div>

          <div className="railcard">
            <p className="label label--muted">About the desk</p>
            <p style={{ marginTop: 8, fontSize: 'var(--fs-small)', color: 'var(--ink-blurb)', lineHeight: 1.55 }}>
              Reporting and analysis on peace, governance and geopolitics across South Sudan and the
              wider Nile basin.
            </p>
            <Link className="section__more" href="/about" style={{ marginTop: 10, borderBottomColor: 'var(--gold)' }}>
              About us →
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
