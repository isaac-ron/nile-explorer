import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getWriters, getSite } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: 'Writers', description: `The people who write for ${site.name}.` };
}

/** Initials for a writer with no portrait: "Dr. Aldo Ajou Deng-Akuey" → "AD". */
const initialsOf = (name: string): string => {
  const words = name
    .replace(/^(dr|prof|mr|mrs|ms|hon|rev)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
};

/**
 * Everyone with a published byline. A writer appears here once their first
 * piece is published and not before, so a name added to the Studio ahead of
 * time does not show up as an empty page.
 */
export default async function WritersPage() {
  const writers = await getWriters();

  return (
    <section className="section shell" aria-labelledby="writers-heading">
      <div className="section__head">
        <h1 id="writers-heading" style={{ fontSize: 'var(--fs-h2)', color: 'var(--navy)' }}>
          Writers
        </h1>
        <span className="label label--muted">
          {writers.length} {writers.length === 1 ? 'writer' : 'writers'}
        </span>
      </div>

      <div className="writers">
        {writers.map((w) => (
          <Link className="writercard" href={`/writers/${w.slug}`} key={w.id}>
            <span className="writercard__face" aria-hidden="true">
              {w.portrait ? (
                <Image
                  src={w.portrait.url}
                  alt=""
                  width={w.portrait.width ?? 1200}
                  height={w.portrait.height ?? 1500}
                  sizes="96px"
                />
              ) : (
                initialsOf(w.name)
              )}
            </span>
            <span className="writercard__text">
              <span className="writercard__name">{w.name}</span>
              {w.role && <span className="writercard__role">{w.role}</span>}
              <span className="writercard__count">
                {w.count} {w.count === 1 ? 'piece' : 'pieces'}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
