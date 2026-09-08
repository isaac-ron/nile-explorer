'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlatformLink } from '@/components/Icons';
import type { PlayerEpisode } from '@/lib/content';

/** Only what the player needs: the full Podcast carries every episode's URL. */
type PlayerShow = { title: string; spotify: { url: string; embed: string } };

type Mode = 'idle' | 'video' | 'audio';

/**
 * Episode player.
 *
 * Keeps the original design's shell — artwork, a circular play button, and a
 * bordered control bar beneath — but the play control loads a real embed
 * instead of ticking a fake progress bar. Audio and video are two renderings
 * of the same episode, so the format is the reader's choice.
 *
 * Neither iframe is mounted until the reader asks for it: an autoplaying
 * embed on page load costs a lot and nobody asked for it.
 *
 * When `videoAvailable` is false the Watch path disappears entirely. The stage
 * then carries the lead still from the recording, with the rest beneath it, so
 * a re-edit in progress is never linked to and the space still says something
 * about the episode. Falls back to the show artwork when no stills exist.
 */
export default function PodcastPlayer({
  episode,
  podcast
}: {
  episode: PlayerEpisode;
  podcast: PlayerShow;
}) {
  const watchable = episode.videoAvailable && !!episode.embed;
  // The lead carries the stage; the rest form the contact sheet below it.
  const [lead, ...rest] = episode.stills;
  const [mode, setMode] = useState<Mode>('idle');

  return (
    <div className="player">
      <div className={`player__stage${mode === 'audio' ? ' player__stage--audio' : ''}`}>
        {mode === 'idle' &&
          (watchable ? (
            <>
              {episode.thumbnail && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={episode.thumbnail} alt={`Artwork for “${episode.title}”`} />
              )}
              <button
                className="player__play"
                type="button"
                onClick={() => setMode('video')}
                aria-label={`Play episode ${episode.number}: ${episode.title}`}
              >
                <span className="player__playglyph" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.2v13.6L19 12z" />
                  </svg>
                </span>
              </button>
            </>
          ) : lead ? (
            <Image
              src={lead.src}
              alt={lead.alt}
              width={lead.width}
              height={lead.height}
              sizes="(max-width: 1000px) 100vw, 700px"
              priority
            />
          ) : (
            <div className="player__holding">
              <Image
                src="/brand/podcast-logo.png"
                alt="The Nile Explorer Podcast"
                width={1729}
                height={1660}
                sizes="260px"
              />
            </div>
          ))}

        {mode === 'video' && watchable && (
          <iframe
            src={`${episode.embed}&autoplay=1`}
            title={`${episode.title} — video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )}

        {mode === 'audio' && (
          <iframe
            src={podcast.spotify.embed}
            title={`${podcast.title} — audio`}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        )}
      </div>

      <div className="player__bar">
        <div className="player__modes" role="group" aria-label="Choose a format">
          {watchable && (
            <button
              type="button"
              className="player__mode"
              aria-pressed={mode === 'video'}
              onClick={() => setMode('video')}
            >
              Watch
            </button>
          )}
          <button
            type="button"
            className="player__mode"
            aria-pressed={mode === 'audio'}
            onClick={() => setMode('audio')}
          >
            Listen
          </button>
        </div>

        <div className="platforms">
          <span className="player__on">On</span>
          <PlatformLink name="spotify" href={podcast.spotify.url} label="Listen on Spotify" />
          {watchable && episode.url && (
            <PlatformLink name="youtube" href={episode.url} label="Watch on YouTube" />
          )}
        </div>
      </div>

      {!watchable && episode.videoNote && (
        <p className="player__notice" role="status">
          {episode.videoNote}
        </p>
      )}

      {!watchable && rest.length > 0 && (
        <figure className="stills">
          <figcaption className="stills__head">
            <span className="label label--muted">From the recording</span>
            {episode.photographer && (
              <span className="stills__credit">Photographs by {episode.photographer}</span>
            )}
          </figcaption>
          <div className="stills__grid">
            {rest.map((s) => (
              <span className="frame frame--square" key={s.src}>
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={s.width}
                  height={s.height}
                  sizes="(max-width: 700px) 45vw, 220px"
                />
              </span>
            ))}
          </div>
        </figure>
      )}
    </div>
  );
}
