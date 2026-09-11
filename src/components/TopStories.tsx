import Image from 'next/image';
import Link from 'next/link';
import { Article, formatDate, formatShortDate, labelFor } from '@/lib/content';

/**
 * The front page trio.
 *
 * Three ranked stories share the fold, with the middle well carrying the lead.
 * The order is elected in getTopStories, not here: `stories[0]` is the main
 * story wherever it ends up on screen, which is why the middle column is
 * rendered from index 0 and the flanks from 1 and 2.
 *
 * Two things stop this collapsing into the same card row as Latest:
 *
 * - The middle well is a portrait image with the headline over the foot of it,
 *   while the flanks are landscape with the headline underneath. Different
 *   image ratio, different text position, so the eye reads a hierarchy rather
 *   than three equal tiles.
 * - The flanks are separated by rules and stack against the middle column, so
 *   the block reads as one composition instead of three detached cards.
 *
 * Source order is lead first, so the h1 comes before the flanks for screen
 * readers and for the single-column stack on mobile. CSS grid puts the lead
 * back in the middle on wide viewports.
 *
 * Stories 4 and 5 hang under each flank, with pictures. The flanks carry less
 * than the lead by design, so their columns ran roughly 380px and 310px short
 * of it; a headline-only version closed about a third of that, and the client
 * asked for the space filled properly, so these take images too.
 *
 * The rule above each still marks them as a continuation of the column rather
 * than a fourth and fifth story of equal rank, and their pictures are smaller
 * than the flank's own.
 */
export default function TopStories({ stories }: { stories: Article[] }) {
  const [lead, flankA, flankB, ...extras] = stories;
  const flanks = [flankA, flankB].filter(Boolean);
  if (!lead) return null;

  return (
    <div className="top">
      <article className="top__lead">
        <Link className="top__leadlink" href={`/articles/${lead.slug}`}>
          {lead.image && (
            <span className="frame top__leadframe">
              <Image
                src={lead.image.url}
                alt={lead.image.alt || `Illustration for “${lead.title}”`}
                width={lead.image.width ?? 1200}
                height={lead.image.height ?? 768}
                sizes="(max-width: 900px) 100vw, 620px"
                preload
              />
            </span>
          )}
          <span className="top__leadtext">
            <span className="top__cat top__cat--onimage">{labelFor(lead)}</span>
            <h1 className="top__leadtitle" id="lead-heading">
              {lead.title}
            </h1>
          </span>
        </Link>
        <p className="top__leaddeck">{lead.summary}</p>
        <p className="top__leadmeta">
          By {lead.author.name} · {formatDate(lead.date)} · {lead.readingTime} min read
        </p>
      </article>

      {flanks.map((a, i) => (
        <article className={`top__flank top__flank--${i === 0 ? 'a' : 'b'}`} key={a.slug}>
          <Link className="top__flanklink" href={`/articles/${a.slug}`}>
            {a.image && (
              <span className="frame frame--wide">
                <Image
                  src={a.image.url}
                  alt={a.image.alt || `Illustration for “${a.title}”`}
                  width={a.image.width ?? 1200}
                  height={a.image.height ?? 800}
                  sizes="(max-width: 900px) 100vw, 330px"
                  preload
                />
              </span>
            )}
            <span className="top__cat">{labelFor(a)}</span>
            <h2 className="top__flanktitle">{a.title}</h2>
          </Link>
          <p className="top__flankblurb">{a.summary}</p>
          <p className="top__flankmeta">
            {formatShortDate(a.date)} · {a.readingTime} min read
          </p>

          {extras[i] && (
            <Link className="top__more" href={`/articles/${extras[i].slug}`}>
              {extras[i].image && (
                <span className="frame frame--wide">
                  <Image
                    src={extras[i].image!.url}
                    alt={extras[i].image!.alt || `Illustration for “${extras[i].title}”`}
                    width={extras[i].image!.width ?? 1200}
                    height={extras[i].image!.height ?? 800}
                    sizes="(max-width: 900px) 100vw, 330px"
                  />
                </span>
              )}
              <span className="top__cat">{labelFor(extras[i])}</span>
              <span className="top__moretitle">{extras[i].title}</span>
              <span className="top__flankmeta">
                {formatShortDate(extras[i].date)} · {extras[i].readingTime} min read
              </span>
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
