import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStrand, getStrands, getStrandArticles, getArchive } from '@/lib/content';
import { StoryRow, RankedItem } from '@/components/Story';
import Empty from '@/components/Empty';

export function generateStaticParams() {
  return getStrands().map((s) => ({ strand: s.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ strand: string }>;
}): Promise<Metadata> {
  const { strand } = await params;
  const s = getStrand(strand);
  if (!s) return {};
  return { title: s.name, description: s.standfirst };
}

export default async function StrandPage({
  params
}: {
  params: Promise<{ strand: string }>;
}) {
  const { strand } = await params;
  const s = getStrand(strand);
  if (!s) notFound();

  const articles = getStrandArticles(s);
  // Short, unlike the front page's rail: this column has an empty state beside
  // it, not a river, and a ten-deep list would leave the page lopsided.
  const archive = getArchive(4);

  return (
    <section className="section">
      <div className="shell withrail">
        <div>
          <div className="section__head">
            <h1 style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>{s.name}</h1>
            {articles.length > 0 && (
              <span className="label label--muted">
                {articles.length} {articles.length === 1 ? 'piece' : 'pieces'}
              </span>
            )}
          </div>

          <p
            style={{
              marginBottom: 'var(--space-5)',
              color: 'var(--ink-blurb)',
              maxWidth: '62ch'
            }}
          >
            {s.standfirst}
          </p>

          {articles.length > 0 ? (
            <div className="river">
              {articles.map((a) => (
                <StoryRow article={a} key={a.slug} />
              ))}
            </div>
          ) : (
            <Empty
              title={`Nothing filed under ${s.name.toLowerCase()} yet`}
              body="This strand is open and waiting on its first piece. Everything the newsroom has published so far sits in the main file."
              action={{ href: '/articles', label: 'Read what is published' }}
            />
          )}
        </div>

        <aside className="rail" aria-label="More from the newsroom">
          <div className="railcard">
            <p className="label label--muted">Also in More</p>
            <div className="strandlinks">
              {getStrands()
                .filter((o) => o.slug !== s.slug)
                .map((o) => (
                  <Link className="strandlinks__item" href={`/more/${o.slug}`} key={o.slug}>
                    {o.name}
                  </Link>
                ))}
            </div>
          </div>

          {archive.length > 0 && (
            <div>
              <h2 className="rail__title">From the archive</h2>
              {/* Keyed by index: getArchive cycles, so slugs repeat. */}
              {archive.map((a, i) => (
                <RankedItem article={a} n={i + 1} key={`${a.slug}-${i}`} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
