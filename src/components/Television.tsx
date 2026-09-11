import Image from 'next/image';
import Link from 'next/link';
import { type Film } from '@/lib/content';

/**
 * Documentary cards.
 *
 * No play badge and no outbound link: none of these is shot yet, so there is
 * nothing to open. The card carries its production status instead and points
 * at the strand page. Square, because the key art is square and a 16:9 frame
 * would crop the title off the bottom of every poster.
 *
 * ProgrammeCard and ProgrammeRow used to live here, rendering the raw YouTube
 * channel feed. They were removed with the ingest: the feed held a live-stream
 * test, two podcast repackages and two third-party speeches, none of which was
 * a documentary, and nothing rendered them.
 */
export function FilmCard({ film }: { film: Film }) {
  if (!film.poster) return null;

  return (
    <Link className="card film" href="/documentaries">
      <span className="frame frame--square">
        <Image
          src={film.poster.url}
          alt={film.poster.alt}
          width={film.poster.width ?? 800}
          height={film.poster.height ?? 800}
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
      {film.poster && (
        <span className="frame frame--square">
          <Image
            src={film.poster.url}
            alt={film.poster.alt}
            width={film.poster.width ?? 800}
            height={film.poster.height ?? 800}
            sizes="(max-width: 700px) 100vw, 210px"
          />
        </span>
      )}
      <span className="episode__body">
        <span className="card__cat">{film.status}</span>
        <span className="episode__title">{film.title}</span>
        <span className="film__standfirst">{film.standfirst}</span>
        <span className="episode__desc">{film.summary}</span>
      </span>
    </article>
  );
}
