import type { Metadata } from 'next';
import Link from 'next/link';
import { getStrands, getStrandArticles } from '@/lib/content';

export const metadata: Metadata = {
  title: 'More',
  description:
    'Cultural commentary, media, entertainment, food, sport and fashion from The Nile Explorer.'
};

/**
 * The landing page behind the More menu.
 *
 * It exists so the menu's own label is a real destination (and so the mobile
 * panel has somewhere to go), not only as a parent for the strands.
 */
export default async function MorePage() {
  const strands = await getStrands();
  const counts = await Promise.all(strands.map(async (s) => (await getStrandArticles(s)).length));

  return (
    <section className="section shell">
      <div className="section__head">
        <h1 style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>More</h1>
      </div>

      <p
        style={{
          marginBottom: 'var(--space-6)',
          color: 'var(--ink-blurb)',
          maxWidth: '62ch'
        }}
      >
        Coverage beyond peace and governance, following the pillars of the Nile Festival: the
        culture, media, food, sport and design of South Sudan and its diaspora.
      </p>

      <div className="strandgrid">
        {strands.map((s, i) => {
          const n = counts[i];
          return (
            <Link className="strandcard" href={`/more/${s.slug}`} key={s.slug}>
              <span className="strandcard__name">{s.name}</span>
              <span className="strandcard__blurb">{s.standfirst}</span>
              <span className="strandcard__meta">
                {n > 0 ? `${n} ${n === 1 ? 'piece' : 'pieces'}` : 'Open for its first piece'}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
