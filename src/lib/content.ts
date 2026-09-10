/**
 * Content access layer.
 *
 * Reads the JSON produced by `npm run ingest`. Everything is static at build
 * time, so pages can be fully prerendered. When the CMS lands, only this file
 * changes: the page components consume these types, not the JSON shape.
 */

import articlesJson from '../../content/articles.json';
import topicsJson from '../../content/topics.json';
import sectionsJson from '../../content/sections.json';
import podcastJson from '../../content/podcast.json';
import televisionJson from '../../content/television.json';
import documentariesJson from '../../content/documentaries.json';
import festivalJson from '../../content/festival.json';
import podcastMetaJson from '../../content/podcast-meta.json';
import pendingJson from '../../content/placeholder-articles.json';

export type Block =
  | { type: 'para'; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] };

export type Image = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  date: string;
  modified: string;
  section: string;
  topic: { name: string; slug: string } | null;
  author: string;
  image: Image | null;
  blocks: Block[];
  summary: string;
  readingTime: number;
  source: string;
};

export type Topic = { name: string; slug: string; count: number };
export type Section = { name: string; slug: string; count: number };

export type Video = {
  kind: 'podcast' | 'television';
  videoId: string;
  slug: string;
  title: string;
  published: string;
  description: string;
  summary: string;
  thumbnail: string;
  url: string;
  embed: string;
  number: number;
};

export type Podcast = {
  title: string;
  rssFeed: string | null;
  spotify: { showId: string; url: string; embed: string };
  episodes: Video[];
};

export type Guest = { name: string; role: string };

/** Intrinsic dimensions are carried so next/image can reserve the box. */
export type Still = { src: string; alt: string; width: number; height: number };

export type EpisodeMeta = {
  blurb?: string;
  topics?: string[];
  guests?: Guest[];
  /** false while an edit is reworked: hides Watch and any link to the video. */
  videoAvailable?: boolean;
  videoNote?: string;
  stills?: Still[];
  /** Credited wherever a still from this episode appears. */
  photographer?: string;
};

export type UpcomingEpisode = {
  title: string;
  blurb?: string;
  topics?: string[];
  guests?: Guest[];
  releaseDate?: string;
};

/** Invented episodes filling the banner strip. See podcast-meta.json. */
export type PlaceholderEpisode = {
  number: number;
  title: string;
  blurb: string;
  date: string;
  thumbnail: string;
  thumbnailAlt: string;
  guests?: Guest[];
};

export type PodcastMeta = {
  show: { tagline: string; blurb: string };
  episodes: Record<string, EpisodeMeta>;
  upcoming: UpcomingEpisode[];
  placeholderEpisodes?: PlaceholderEpisode[];
};

/** A documentary. Curated in documentaries.json, not ingested. */
export type Film = {
  slug: string;
  title: string;
  standfirst: string;
  summary: string;
  poster: string;
  posterAlt: string;
  status: string;
};

/** An episode with its hand-edited metadata folded in. */
export type EpisodeWithMeta = Video & EpisodeMeta;

export type Festival = {
  name: string;
  datesAnnounced: boolean;
  dates: string;
  standfirst: string;
  blurb: string;
  strands: { name: string; detail: string }[];
  awards: { name: string; detail: string };
};

const articles = articlesJson as Article[];
const topics = topicsJson as Topic[];
const sections = sectionsJson as Section[];
const podcast = podcastJson as Podcast;
const television = televisionJson as Video[];
const films = (documentariesJson as { films: Film[] }).films;
const festival = festivalJson as Festival;
const podcastMeta = podcastMetaJson as unknown as PodcastMeta;
const pending = (pendingJson as { stories: PendingStory[] }).stories;

export const getArticles = (): Article[] => articles;

export const getArticle = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

/* ---------------------------------------------------------------------------
   Top stories
   ---------------------------------------------------------------------------
   The front page leads on a ranked trio rather than a single editor's pick, so
   the ordering needs to come from somewhere. Today nothing measures anything,
   so it falls through to recency, which is an arbitrary but honest default.

   THE SWAP POINT IS `popularity` BELOW. Fill it with slug -> score from
   whatever lands first (page views, click counts, a CMS "featured" weight) and
   both the lead and the running order re-elect themselves with no change to
   any component. Scores are relative, not absolute: only their order matters.
--------------------------------------------------------------------------- */

/** slug -> score. Empty until a metric source exists. Higher wins. */
const popularity: Record<string, number> = {};

/** Recency in ms, used as the tiebreak and as the whole score while unmeasured. */
const recencyOf = (a: Article): number => +new Date(a.date);

const scoreOf = (a: Article): number => popularity[a.slug] ?? 0;

/**
 * The stories that lead the front page, best first.
 *
 * `[0]` is the main story: the biggest well in the hero, and the page's `h1`.
 * Ties (which is every article today, since every score is 0) break on recency,
 * so the current behaviour is exactly the old "newest first" lead.
 */
export const getTopStories = (count = 3): Article[] =>
  [...articles]
    .sort((a, b) => scoreOf(b) - scoreOf(a) || recencyOf(b) - recencyOf(a))
    .slice(0, count);

/** True once anything is actually measuring. Lets the UI stop saying "Latest". */
export const hasPopularityData = (): boolean => Object.keys(popularity).length > 0;

export const getTopics = (): Topic[] => topics;

export const getSections = (): Section[] => sections;

export const getArticlesByTopic = (slug: string): Article[] =>
  articles.filter((a) => a.topic?.slug === slug);

export const getArticlesBySection = (slug: string): Article[] =>
  articles.filter((a) => a.section.toLowerCase() === slug);

/**
 * What to print in a kicker. Most pieces carry a subject topic; those whose
 * WordPress category was really a section fall back to the section name so the
 * kicker is never blank.
 */
export const labelFor = (a: Article): string => a.topic?.name ?? a.section;

export const getPodcast = (): Podcast => podcast;

export const getPodcastMeta = (): PodcastMeta => podcastMeta;

/** Episodes with guests, topics and a hand-written blurb folded in where present. */
export const getEpisodes = (): EpisodeWithMeta[] =>
  podcast.episodes.map((e) => ({ ...e, ...(podcastMeta.episodes[e.videoId] ?? {}) }));

export const getLatestEpisode = (): EpisodeWithMeta | undefined => getEpisodes()[0];

/** Default true: an episode is watchable unless meta says otherwise. */
export const canWatch = (e: EpisodeWithMeta): boolean => e.videoAvailable !== false;

export type PlayerEpisode = {
  number: number;
  title: string;
  /** Null while withdrawn: the YouTube thumbnail URL carries the video id. */
  thumbnail: string | null;
  videoAvailable: boolean;
  videoNote?: string;
  stills: Still[];
  photographer?: string;
  /** Null while the video is withdrawn, so the URL never reaches the client. */
  url: string | null;
  embed: string | null;
};

/**
 * Narrow an episode to what the player needs.
 *
 * The player is a client component, so whatever it receives is serialized into
 * the RSC payload and readable in page source. Passing the whole episode leaked
 * the video URL even with every link to it removed.
 */
export function toPlayerEpisode(e: EpisodeWithMeta): PlayerEpisode {
  const watchable = canWatch(e);
  return {
    number: e.number,
    title: e.title,
    thumbnail: watchable ? e.thumbnail : null,
    videoAvailable: watchable,
    videoNote: e.videoNote,
    stills: e.stills ?? [],
    photographer: e.photographer,
    url: watchable ? e.url : null,
    embed: watchable ? e.embed : null
  };
}

/** Scheduled but unreleased. Empty until someone fills in podcast-meta.json. */
export const getUpcoming = (): UpcomingEpisode[] => podcastMeta.upcoming;

/**
 * Renamed from Television. The ingested YouTube feed is still in
 * television.json and still carries `kind: 'television'`, but the strand now
 * shows the curated films in documentaries.json instead: the feed held a test
 * upload, two podcast repackages and two third-party speeches, none of which
 * is a documentary.
 *
 * PLACEHOLDER: the three films are not commissioned and their key art is
 * AI-generated. Empty `films` in that file and this falls back to the feed.
 */
export const getDocumentaries = (): Film[] => films;

/** The ingested channel feed, kept for the fallback and for reference. */
export const getChannelFeed = (): Video[] => television;

/* ---------------------------------------------------------------------------
   Podcast episodes for the banner strip
   ---------------------------------------------------------------------------
   The banner carries three episodes. One exists. The other two are invented
   and live under `placeholderEpisodes` in podcast-meta.json, flagged there.
   Both shapes are normalised here so the strip does not have to know which is
   which, and so deleting the placeholders degrades to however many are real.
--------------------------------------------------------------------------- */

export type BannerEpisode = {
  number: number;
  title: string;
  blurb: string;
  date: string;
  thumbnail: string;
  thumbnailAlt: string;
  guests: Guest[];
  /** False for the invented ones: they get no link, because there is nothing to open. */
  published: boolean;
};

/**
 * Strip a trailing "Episode N" from a YouTube title.
 *
 * The upload is called "Peace, War and the Search for a Political Solution.
 * Episode 1", and the band prints "Episode 1" as the kicker directly above it.
 * That read as a typo once the lead episode's headline grew to fill two-thirds
 * of the band. Only the display copy is trimmed; the ingested title is
 * untouched, so the podcast page and the player still show it in full.
 */
const trimEpisodeSuffix = (title: string): string =>
  title.replace(/[.\s—–-]*\s*Episode\s+\d+\s*$/i, '').trim() || title;

export const getBannerEpisodes = (count = 3): BannerEpisode[] => {
  const real: BannerEpisode[] = getEpisodes().map((e) => ({
    number: e.number,
    title: trimEpisodeSuffix(e.title),
    blurb: e.blurb ?? e.summary,
    date: e.published,
    thumbnail: e.stills?.[0]?.src ?? e.thumbnail,
    thumbnailAlt: e.stills?.[0]?.alt ?? `Artwork for “${e.title}”`,
    guests: e.guests ?? [],
    published: true
  }));

  const invented: BannerEpisode[] = (podcastMeta.placeholderEpisodes ?? []).map((p) => ({
    number: p.number,
    title: p.title,
    blurb: p.blurb,
    date: p.date,
    thumbnail: p.thumbnail,
    thumbnailAlt: p.thumbnailAlt,
    guests: p.guests ?? [],
    published: false
  }));

  return [...real, ...invented].slice(0, count);
};

export const getFestival = (): Festival => festival;

/* ---------------------------------------------------------------------------
   PLACEHOLDER FESTIVAL IMAGERY  —  REPLACE BEFORE THE INAUGURAL EDITION
   ---------------------------------------------------------------------------
   The Nile Festival has not happened, so none of these is a photograph of it.
   They are licensed stock standing in until the first edition is shot.

   Swap: drop the real photographs into public/festival/, point `src` at them,
   rewrite `alt` to describe the actual scene, and remove the images.unsplash.com
   entry from next.config.ts. Nothing else references these.

   Alt text describes what is in each frame and does not claim the festival as
   its subject, so the page never asserts something untrue to a screen reader.
--------------------------------------------------------------------------- */
const festivalSlides = [
  {
    src: 'https://images.unsplash.com/photo-1784123476511-c8f9da501f5d?auto=format&fit=crop&w=1900&q=70',
    alt: 'Dancers in blue and gold wax-print dress performing outside a large stone building.'
  },
  {
    src: 'https://images.unsplash.com/photo-1764670085286-55cd79507a72?auto=format&fit=crop&w=1900&q=70',
    alt: 'Three drummers playing together at an outdoor gathering.'
  },
  {
    src: 'https://images.unsplash.com/photo-1758875913518-7869eb5e1e91?auto=format&fit=crop&w=1900&q=70',
    alt: 'A group in traditional dress dancing together in the open air.'
  },
  {
    src: 'https://images.unsplash.com/photo-1778848268262-3a9e40cae69c?auto=format&fit=crop&w=1900&q=70',
    alt: 'Performers in costume on a lit stage at night.'
  },
  {
    src: 'https://images.unsplash.com/photo-1764145162259-04eaf2b3d86a?auto=format&fit=crop&w=1900&q=70',
    alt: 'A crowd in white dress gathered outdoors for a celebration.'
  }
];

export const getFestivalSlides = () => festivalSlides;

/* ---------------------------------------------------------------------------
   Editorial strands behind the More menu
   ---------------------------------------------------------------------------
   Coverage areas that mirror the Nile Festival's pillars. None of them holds an
   article yet; the routes exist so the menu is real and so the newsroom has
   somewhere to publish into. Each page falls back to an empty state that says
   so plainly rather than showing an empty list.

   `topic` maps a strand to an existing topic slug when one appears in
   topics.json, so a strand starts filling itself the moment the ingest carries
   pieces tagged that way.
--------------------------------------------------------------------------- */

export type Strand = {
  slug: string;
  name: string;
  standfirst: string;
  /** Topic slug to pull articles from, when the newsroom starts tagging them. */
  topic?: string;
};

const strands: Strand[] = [
  {
    slug: 'culture',
    name: 'Cultural commentary',
    standfirst:
      'Writing on the traditions, languages and public life carried between South Sudan and its diaspora.',
    topic: 'culture'
  },
  {
    slug: 'media',
    name: 'Media',
    standfirst:
      'The press, broadcasting and information environment across the region, and who gets to tell the story.',
    topic: 'media'
  },
  {
    slug: 'entertainment',
    name: 'Entertainment',
    standfirst: 'Music, film, performance and the people making them.',
    topic: 'entertainment'
  },
  {
    slug: 'food',
    name: 'Food',
    standfirst: 'The cooking of the river and the regions, and the people who keep it.',
    topic: 'food'
  },
  {
    slug: 'sport',
    name: 'Sport',
    standfirst:
      'Competition across the states, and the athletes who carry the country’s name abroad.',
    topic: 'sport'
  },
  {
    slug: 'fashion',
    name: 'Fashion & textiles',
    standfirst: 'Designers and makers working with South Sudanese cloth, pattern and form.',
    topic: 'fashion'
  }
];

export const getStrands = (): Strand[] => strands;

export const getStrand = (slug: string): Strand | undefined =>
  strands.find((s) => s.slug === slug);

/** Articles filed under a strand. Empty for every strand today. */
export const getStrandArticles = (strand: Strand): Article[] =>
  strand.topic ? articles.filter((a) => a.topic?.slug === strand.topic) : [];

/**
 * Sidebar recommendations.
 *
 * The previous version mixed same-category and merely-recent pieces under one
 * heading, so "Also in this story" routinely listed things that had nothing to
 * do with the story. This returns the heading alongside the articles so the
 * label always describes what is actually in the list.
 */
export function getRelated(
  article: Article,
  limit = 4
): { heading: string; articles: Article[] } {
  const sameTopic = article.topic
    ? articles.filter((a) => a.slug !== article.slug && a.topic?.slug === article.topic!.slug)
    : [];

  if (sameTopic.length >= 2) {
    return {
      heading: `More on ${article.topic!.name}`,
      articles: sameTopic.slice(0, limit)
    };
  }

  return {
    heading: 'More from the newsroom',
    articles: articles.filter((a) => a.slug !== article.slug).slice(0, limit)
  };
}

/* ---------------------------------------------------------------------------
   Commissioned pieces that have not been filed
   ---------------------------------------------------------------------------
   The Analysis & opinion river runs three pieces deep, because the front-page
   trio takes the five most recent and there are only eleven articles in all.
   That left the column finishing well above the archive rail beside it.

   These fill it. They are inventions, they live in placeholder-articles.json
   flagged as such, and nothing renders them as links: a headline that opens
   nothing is worse than a headline that says it is not written yet.

   They are deliberately NOT merged into `articles`. Doing that would put them
   in /articles, in the topic counts, in the sitemap and in getRelated, and the
   ingest would then have to know to leave them alone. Keeping them a separate
   list means one component knows about them and deleting the file is enough.
--------------------------------------------------------------------------- */

export type PendingStory = {
  slug: string;
  topic: string;
  title: string;
  standfirst: string;
  author: string;
  /** Printed beside the kicker. What stops the row reading as published. */
  status: string;
};

export const getPendingStories = (): PendingStory[] => pending;

/**
 * Oldest pieces first, for the rail beside Analysis & opinion.
 *
 * The rail is sized to hold `limit` items so the column reaches the foot of the
 * river instead of leaving a well of white under the patron's quote. There are
 * currently fewer articles in the archive than slots in the rail, so the list
 * cycles: once the pool is exhausted it starts again from the oldest.
 *
 * That is a stopgap and it is visible as one, because the same headlines appear
 * twice in one column. It resolves itself with no code change the moment the
 * archive holds `limit` pieces, which is the point of filling by cycling rather
 * than by padding with something invented. `archiveCapacity` below is the
 * number to grow into.
 *
 * Callers must key on index, not slug: slugs repeat here.
 */
export const getArchive = (limit = 4): Article[] => {
  const pool = [...articles].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  if (pool.length === 0) return [];
  return Array.from({ length: limit }, (_, i) => pool[i % pool.length]);
};

/**
 * Slots the front-page rail is built to hold. See getArchive.
 *
 * Sized against the river beside it, which now runs two commissioned pieces
 * past its last published one. Twelve slots against eleven articles means one
 * repeat at the foot; ten left the rail 100px short of the river.
 */
export const archiveCapacity = 12;

/** How many of those slots can be filled without repeating. */
export const archiveDepth = (): number => Math.min(articles.length, archiveCapacity);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

export const formatShortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const SITE = {
  name: 'The Nile Explorer',
  tagline: 'The Mirror of Africa',
  description:
    'Independent reporting, analysis and opinion on peace, governance and geopolitics across South Sudan and the Nile basin.',
  url: 'https://nilexplorer.net',
  youtube: 'https://www.youtube.com/@thenilexplorerpodcast',
  instagram: 'https://www.instagram.com/thenilexplorer_podcast',
  spotify: podcast.spotify.url,
  email: 'newsroom@nilexplorer.net',
  patron: 'Dr. Aldo Ajou Deng-Akuey'
} as const;
