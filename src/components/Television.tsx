import Image from 'next/image';
import Link from 'next/link';
import { formatShortDate, type Film, type Video } from '@/lib/content';

/**
 * A documentary, shown by its key art.
 *
 * No play badge and no outbound link: none of these is shot yet, so there is
 * nothing to open. The card carries its production status instead and points
 * at the strand page. Square, because the supplied art is square and a 16:9
 * frame would crop the title off the bottom of every poster.
 */
export function FilmCard({ film }: { film: Film }) {
  return (
    <Link className="card film" href="/documentaries">
      <span className="frame frame--square">
        <Image
          src={film.poster}
          alt={film.posterAlt}
          width={800}
          height={800}
          sizes="(max-width: 700px) 100vw, 400px"
        />
      </span>
      <span className="card__cat">{film.status}</span>
      <span className="card__title">{film.title}</span>
      <span className="film__standfirst">{film.standfirst}</span>
      <span className="card__blurb">{film.summary}</span>
    </Link>
  );
}

export function FilmRow({ film }: { film: Film }) {
  return (
    <article className="episode film">
      <span className="frame frame--square">
        <Image
          src={film.poster}
          alt={film.posterAlt}
          width={800}
          height={800}
          sizes="(max-width: 700px) 100vw, 210px"
        />
      </span>
      <span className="episode__body">
        <span className="card__cat">{film.status}</span>
        <span className="episode__title">{film.title}</span>
        <span className="film__standfirst">{film.standfirst}</span>
        <span className="episode__desc">{film.summary}</span>
      </span>
    </article>
  );
}

/**
 * A television item links straight out to YouTube. Only the podcast episode
 * gets an on-site player; everything else on the channel is a programme, and
 * sending the reader to the channel is the honest destination.
 */
export function ProgrammeCard({ video }: { video: Video }) {
  return (
    <a className="card" href={video.url} target="_blank" rel="noopener noreferrer">
      <span className="frame frame--wide">
        <Image
          src={video.thumbnail}
          alt={`Still from “${video.title}”`}
          width={1280}
          height={720}
          sizes="(max-width: 700px) 100vw, 320px"
        />
        <span className="playbadge" aria-hidden="true">
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.2v13.6L19 12z" />
            </svg>
          </span>
        </span>
      </span>
      <span className="card__cat">Programme</span>
      <span className="card__title">{video.title}</span>
      <span className="card__meta">{formatShortDate(video.published)}</span>
    </a>
  );
}

export function ProgrammeRow({ video }: { video: Video }) {
  return (
    <a className="episode" href={video.url} target="_blank" rel="noopener noreferrer">
      <span className="frame frame--wide">
        <Image
          src={video.thumbnail}
          alt=""
          width={1280}
          height={720}
          sizes="(max-width: 700px) 100vw, 210px"
        />
        <span className="playbadge" aria-hidden="true">
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.2v13.6L19 12z" />
            </svg>
          </span>
        </span>
      </span>
      <span className="episode__body">
        <span className="card__cat">Programme</span>
        <span className="episode__title">{video.title}</span>
        {video.summary && <span className="episode__desc">{video.summary}</span>}
        <span className="card__meta">{formatShortDate(video.published)}</span>
      </span>
    </a>
  );
}
