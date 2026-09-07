import Image from 'next/image';
import { formatShortDate, type Video } from '@/lib/content';

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
