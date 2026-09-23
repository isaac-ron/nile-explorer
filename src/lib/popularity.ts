/**
 * How popular an article is right now, from its readership counts.
 *
 * Shared by the front page (getFrontPage in content.ts, which picks Top
 * stories) and the Studio's Home dashboard (Most read), so the two can never
 * disagree about what "popular" means. Plain functions with no Next or Sanity
 * imports, because the Studio runs in the browser.
 */

export type DayBucket = { views?: number; shares?: number };
export type RawStats = {
  article: string;
  views?: number;
  shares?: number;
  days?: Record<string, DayBucket>;
};

/** Readership older than this does not count towards the ranking at all. */
export const POPULARITY_WINDOW_DAYS = 14;
/** A day's reads count half as much this many days later. */
const POPULARITY_HALF_LIFE_DAYS = 3;
/**
 * A share is worth this many reads. Sharing is a stronger signal than opening —
 * someone put their own name to it — and much rarer, so unweighted it would
 * barely register.
 */
const SHARE_WEIGHT = 5;

/** `d20260923` → midnight UTC on that day. The tracker writes these keys. */
const dayOf = (key: string): number | null => {
  const m = /^d(\d{4})(\d{2})(\d{2})$/.exec(key);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
};

/**
 * Recent readership, decayed by age.
 *
 * Summed over day buckets rather than lifetime totals, so a piece that was
 * read heavily a month ago does not hold the front page against one being
 * read now.
 */
export function popularityOf(stats: RawStats | undefined, now: number): number {
  let score = 0;
  for (const [key, bucket] of Object.entries(stats?.days ?? {})) {
    const day = dayOf(key);
    if (day === null) continue;
    const age = (now - day) / 86_400_000;
    if (age < 0 || age > POPULARITY_WINDOW_DAYS) continue;
    const weight = 0.5 ** (age / POPULARITY_HALF_LIFE_DAYS);
    score += ((bucket.views ?? 0) + SHARE_WEIGHT * (bucket.shares ?? 0)) * weight;
  }
  return score;
}
