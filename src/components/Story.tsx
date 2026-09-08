import Image from 'next/image';
import Link from 'next/link';
import { Article, formatDate, formatShortDate } from '@/lib/content';

/** Fallback alt when WordPress supplied none. */
const altFor = (a: Article) => a.image?.alt || `Illustration for “${a.title}”`;

export function ArticleCard({ article, priority }: { article: Article; priority?: boolean }) {
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
            priority={priority}
          />
        </span>
      )}
      <span className="card__cat">{article.category.name}</span>
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
        <span className="card__cat">{article.category.name}</span>
        <h3 className="story__title">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="story__blurb">{article.summary}</p>
        <div className="story__meta">
          <span>{article.author}</span>
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

export function SideStory({ article }: { article: Article }) {
  return (
    <Link className="sidestory" href={`/articles/${article.slug}`}>
      <span className="card__cat">{article.category.name}</span>
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
