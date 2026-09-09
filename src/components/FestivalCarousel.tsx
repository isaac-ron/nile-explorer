'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export type Slide = { src: string; alt: string };

/**
 * Hero images behind the festival band.
 *
 * Auto-advancing, as asked. Three things keep that from being broken rather
 * than merely loud:
 *
 * - A pause control. WCAG 2.2.2 requires a way to stop anything that moves on
 *   its own for more than five seconds, and this moves every six.
 * - prefers-reduced-motion holds it on the first slide and cross-fades nothing.
 * - Only the first slide is priority-loaded; the rest are lazy. The audience is
 *   on mid-range Android over a weak connection, and a carousel otherwise pays
 *   full freight for images most people never see.
 *
 * Slides cross-fade rather than slide, because the band's text sits on top of
 * them and horizontal movement under fixed copy reads as a glitch.
 */
export default function FestivalCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (paused || reduced || slides.length < 2) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduced, slides.length]);

  if (slides.length === 0) return null;

  const running = !paused && !reduced && slides.length > 1;

  return (
    <div className="fest__bg">
      {/* Hidden from assistive tech: the band's meaning is its text, and these
          are a decorative ground behind it. The controls sit outside this
          wrapper, because focusable elements inside aria-hidden are
          unreachable and invalid. */}
      <div className="fest__slides" aria-hidden="true">
        {slides.map((s, i) => (
          <div
            className={i === index ? 'fest__slide fest__slide--on' : 'fest__slide'}
            key={s.src}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              sizes="100vw"
              priority={i === 0}
              quality={70}
            />
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="fest__controls">
          <button
            type="button"
            className="fest__pause"
            onClick={() => setPaused((p) => !p)}
            aria-label={running ? 'Pause festival images' : 'Play festival images'}
          >
            {running ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1.5" y="1" width="3" height="10" />
                <rect x="7.5" y="1" width="3" height="10" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2.5 1.2v9.6L10.5 6z" />
              </svg>
            )}
          </button>

          <div className="fest__dots">
            {slides.map((s, i) => (
              <button
                type="button"
                key={s.src}
                className={i === index ? 'fest__dot fest__dot--on' : 'fest__dot'}
                aria-label={`Festival image ${i + 1} of ${slides.length}`}
                aria-current={i === index}
                onClick={() => {
                  setIndex(i);
                  setPaused(true);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
