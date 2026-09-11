import Image from 'next/image';
import Link from 'next/link';
import { Article, PendingStory, formatDate, formatShortDate, labelFor } from '@/lib/content';

/**
 * Fallback alt.
 *
 * The CMS requires a description on every image, so this should never fire.
 * It stays for the archive pieces imported from WordPress, which arrived with
 * empty alt attributes and may not all have been described yet.
 */
const altFor = (a: Article) => a.image?.alt || `Illustration for “${a.title}”`;

export function ArticleCard({ article, preload }: { article: Article; preload?: boolean }) {
  return (
    <Link className="card" href={`/articles/${article.slug}`}>
      {article.image && (
        <span className="frame frame--card">
          <Image
            src={article.image.url}
            alt={altFor(article)}
            width={article.image.width ?? 1200}
            height={article.image.height ?? 800}
            sizes="(max-width: 700px) 100vw, 300px"
            preload={preload}
          />
        </span>
      )}
      <span className="card__cat">{labelFor(article)}</span>
      <span className="card__title">{article.title}</span>
      <span className="card__blurb">{article.summary}</span>
      <span className="card__meta">
        {formatShortDate(article.date)} · {article.readingTime} min read
      </span>
    </Link>
  );
}

export function StoryRow({ article }: { article: Article }) {
  return (
    <article className="story">
      <div className="story__body">
        <span className="card__cat">{labelFor(article)}</span>
        <h3 className="story__title">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="story__blurb">{article.summary}</p>
        <div className="story__meta">
          <span>{article.author.name}</span>
          <span className="dot">{formatDate(article.date)}</span>
          <span className="dot">{article.readingTime} min read</span>
        </div>
      </div>
      {article.image && (
        <Link
          className="frame frame--card story__thumb"
          href={`/articles/${article.slug}`}
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={article.image.url}
            alt=""
            width={article.image.width ?? 1200}
            height={article.image.height ?? 800}
            sizes="(max-width: 700px) 100vw, 200px"
          />
        </Link>
      )}
    </article>
  );
}

/**
 * A commissioned piece that has not been filed, running in the river.
 *
 * Same rhythm as StoryRow so the column reads as one continuous list rather
 * than as a widget bolted on the end, but an <article> and not a link, and no
 * picture: there is no photograph of a piece nobody has written. The status
 * mark beside the kicker is doing the honest work here — without it these read
 * as published stories that fail to open. These are articles whose stage is
 * "Commissioned" in the Studio.
 */
export function PendingRow({ story }: { story: PendingStory }) {
  return (
    <article className="story story--pending">
      <div className="story__body">
        <span className="card__cat story__kicker">
          {story.topic}
          <span className="mark mark--soon">{story.status}</span>
        </span>
        <h3 className="story__title">{story.title}</h3>
        <p className="story__blurb">{story.standfirst}</p>
        <div className="story__meta">
          <span>{story.author}</span>
        </div>
      </div>
    </article>
  );
}

export function SideStory({ article }: { article: Article }) {
  return (
    <Link className="sidestory" href={`/articles/${article.slug}`}>
      <span className="card__cat">{labelFor(article)}</span>
      <span className="sidestory__title">{article.title}</span>
      <span className="sidestory__blurb">{article.summary}</span>
      <span className="sidestory__meta">
        {formatShortDate(article.date)} · {article.readingTime} min
      </span>
    </Link>
  );
}

export function RankedItem({ article, n }: { article: Article; n: number }) {
  return (
    <Link className="ranked" href={`/articles/${article.slug}`}>
      <span className="ranked__n" aria-hidden="true">
        {n}
      </span>
      <span className="ranked__title">{article.title}</span>
    </Link>
  );
}
