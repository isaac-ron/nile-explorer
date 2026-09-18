/**
 * Content access layer.
 *
 * Reads from Sanity. Everything runs at build time and is baked into static
 * HTML; publishing triggers a rebuild. Page components consume the types
 * below, not the shape Sanity returns, so a change to a GROQ projection stops
 * here rather than rippling through the app.
 *
 * Every getter is async. Most callers are already async server components and
 * need only an `await`; anything calling these at module scope has to move the
 * call inside the component.
 */

import type { PortableTextBlock } from '@portabletext/types';
import { sanityFetch } from './sanity/client';
import { toImage, type SanityImage } from './sanity/image';
import * as Q from './sanity/queries';

export type { PortableTextBlock };

export type Image = {
  url: string;
  /** Describes the frame, for screen readers. Never printed. */
  alt: string;
  width: number | null;
  height: number | null;
  /** Printed under the picture. Separate from alt, which says something else. */
  caption?: string;
  credit?: string;
};

export type Author = {
  name: string;
  role?: string;
  colophon?: string;
  isPatron?: boolean;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  date: string;
  state: 'published' | 'commissioned';
  section: string;
  topic: { name: string; slug: string } | null;
  author: Author;
  /**
   * Where it was reported from. Absent means none is known — do not guess. The
   * old ingest printed a hardcoded "Juba" on every piece, which was wrong the
   * moment one was filed from Nairobi.
   */
  dateline?: string;
  image: Image | null;
  body: PortableTextBlock[];
  summary: string;
  readingTime: number;
  weight?: number;
};

export type Topic = { name: string; slug: string; count: number };
export type Section = { name: string; slug: string; count: number };

export type Guest = { name: string; role: string };

export type Episode = {
  id: string;
  number: number;
  title: string;
  slug: string;
  published: string;
  state: 'published' | 'upcoming';
  blurb: string;
  youtubeId: string | null;
  videoAvailable: boolean;
  videoNote?: string;
  guests: Guest[];
  topics: string[];
  stills: Image[];
  photographer?: string;
  placeholder: boolean;
  /** Derived from youtubeId, and null while the video is withdrawn. */
  thumbnail: string | null;
  url: string | null;
  embed: string | null;
};

export type UpcomingEpisode = {
  title: string;
  blurb?: string;
  topics?: string[];
  guests?: Guest[];
  releaseDate?: string;
};

export type Film = {
  slug: string;
  title: string;
  standfirst: string;
  summary: string;
  status: string;
  placeholder: boolean;
  poster: Image | null;
};

export type Strand = {
  slug: string;
  name: string;
  standfirst: string;
  topic?: string;
};

export type NavItem = {
  label: string;
  href: string;
  expandStrands?: boolean;
};

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  youtube?: string;
  youtubeHandle?: string;
  instagram?: string;
  instagramHandle?: string;
  newsletterAction?: string;
  patron?: { name: string; role?: string };
  pullQuote?: { text?: string; attribution?: string };
  nav: NavItem[];
};

export type NamedDetail = { name: string; detail: string };

export type AboutPage = {
  /** Opens the page: what the platform is, before who founded it. */
  intro: PortableTextBlock[];
  patronKicker?: string;
  patronRole?: string;
  editorialNote?: string;
  themesHeading?: string;
  themes: NamedDetail[];
  publicationHeading?: string;
  publicationBody: PortableTextBlock[];
  contactBlurb?: string;
  correctionsNote?: string;
  patron?: Author & { bio?: PortableTextBlock[]; portrait: Image | null };
};

export type Festival = {
  name: string;
  standfirst: string;
  blurb: string;
  foundationBody?: PortableTextBlock[];
  editorialNote?: string;
  datesAnnounced: boolean;
  dates?: string;
  strands: NamedDetail[];
  awards?: NamedDetail;
  slides: Image[];
};

export type PodcastShow = {
  title: string;
  tagline?: string;
  blurb?: string;
  spotifyShowId?: string;
  rssFeed?: string;
  appleUrl?: string;
  /** Built from spotifyShowId. Null when no show id is set. */
  spotifyEmbed: string | null;
  spotifyUrl: string | null;
};

export type PendingStory = {
  slug: string;
  topic: string;
  title: string;
  standfirst: string;
  author: string;
  status: string;
};

/* ---------------------------------------------------------------------------
   Fetching
   ---------------------------------------------------------------------------
   A build renders every route separately, and most routes ask for the
   articles. Without this memo that is one network round trip per route per
   query, which turns a thirty-second build into a slow one for no reason.

   The memo is deliberately skipped when previewing a draft: the whole point of
   preview is to see what was just typed.
--------------------------------------------------------------------------- */

const cache = new Map<string, Promise<unknown>>();

function query<T>(q: string, params: Record<string, unknown> = {}, preview = false): Promise<T> {
  if (preview) return sanityFetch<T>(q, params, true);
  const key = q + JSON.stringify(params);
  if (!cache.has(key)) cache.set(key, sanityFetch<T>(q, params));
  return cache.get(key) as Promise<T>;
}

/* ---------------------------------------------------------------------------
   Derived values
--------------------------------------------------------------------------- */

/** Words in a Portable Text body, for the reading estimate. */
function wordCount(body: PortableTextBlock[] | undefined): number {
  if (!Array.isArray(body)) return 0;
  return body.reduce((n, block) => {
    const children = (block as { children?: { text?: string }[] }).children;
    if (!Array.isArray(children)) return n;
    const text = children.map((c) => c.text ?? '').join(' ');
    return n + text.split(/\s+/).filter(Boolean).length;
  }, 0);
}

const readingTime = (body: PortableTextBlock[] | undefined): number =>
  Math.max(1, Math.round(wordCount(body) / 220));

type RawArticle = Omit<Article, 'image' | 'readingTime'> & { image: SanityImage | null };

const hydrateArticle = (a: RawArticle): Article => ({
  ...a,
  image: toImage(a.image),
  readingTime: readingTime(a.body)
});

type RawEpisode = Omit<Episode, 'stills' | 'thumbnail' | 'url' | 'embed'> & {
  stills: SanityImage[] | null;
};

/**
 * Fill in the YouTube URLs an episode implies.
 *
 * When the video is withdrawn these stay null rather than being computed and
 * hidden later, so the id never reaches a page in the first place. See
 * toPlayerEpisode below for why that matters.
 */
const hydrateEpisode = (e: RawEpisode): Episode => {
  const watchable = e.videoAvailable !== false && Boolean(e.youtubeId);
  return {
    ...e,
    stills: (e.stills ?? []).map(toImage).filter((i): i is Image => i !== null),
    thumbnail: watchable ? `https://i.ytimg.com/vi/${e.youtubeId}/maxresdefault.jpg` : null,
    url: watchable ? `https://www.youtube.com/watch?v=${e.youtubeId}` : null,
    embed: watchable ? `https://www.youtube-nocookie.com/embed/${e.youtubeId}?rel=0` : null
  };
};

/* ---------------------------------------------------------------------------
   Articles
--------------------------------------------------------------------------- */

export const getArticles = async (preview = false): Promise<Article[]> =>
  (await query<RawArticle[]>(Q.ARTICLES_QUERY, {}, preview)).map(hydrateArticle);

export const getArticle = async (
  slug: string,
  preview = false
): Promise<Article | undefined> => {
  const a = await query<RawArticle | null>(Q.ARTICLE_BY_SLUG_QUERY, { slug }, preview);
  return a ? hydrateArticle(a) : undefined;
};

export const getArticleSlugs = async (): Promise<string[]> =>
  query<string[]>(Q.ARTICLE_SLUGS_QUERY);

/* ---------------------------------------------------------------------------
   Top stories
   ---------------------------------------------------------------------------
   The front page leads on a ranked set rather than a single editor's pick.
   Ordering comes from the `weight` field an editor can set in the Studio;
   everything unweighted falls through to recency, which is an arbitrary but
   honest default and the normal case.

   Setting a weight is the deliberate act of promoting something. Clearing it
   lets the page go back to leading on whatever is newest, with nothing to
   remember to undo.
--------------------------------------------------------------------------- */

const recencyOf = (a: Article): number => +new Date(a.date);
const scoreOf = (a: Article): number => a.weight ?? 0;

/**
 * The stories that lead the front page, best first.
 *
 * `[0]` is the main story: the biggest well in the hero, and the page's `h1`.
 * TopStories expects at least five to fill the flanks and the rows under them.
 */
export const getTopStories = async (count = 3): Promise<Article[]> =>
  [...(await getArticles())]
    .sort((a, b) => scoreOf(b) - scoreOf(a) || recencyOf(b) - recencyOf(a))
    .slice(0, count);

export const getTopics = async (): Promise<Topic[]> => query<Topic[]>(Q.TOPICS_QUERY);

/** Sections in use, counted from the articles that carry them. */
export const getSections = async (): Promise<Section[]> => {
  const names = await query<string[]>(Q.SECTIONS_QUERY);
  const counts = new Map<string, number>();
  for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: name.toLowerCase(), count }))
    .sort((a, b) => b.count - a.count);
};

export const getArticlesByTopic = async (slug: string): Promise<Article[]> =>
  (await getArticles()).filter((a) => a.topic?.slug === slug);

export const getArticlesBySection = async (slug: string): Promise<Article[]> =>
  (await getArticles()).filter((a) => a.section.toLowerCase() === slug);

/**
 * What to print in a kicker. Most pieces carry a subject topic; those without
 * one fall back to the section name so the kicker is never blank.
 */
export const labelFor = (a: Article): string => a.topic?.name ?? a.section;

/**
 * Sidebar recommendations.
 *
 * Returns the heading alongside the articles so the label always describes
 * what is actually in the list — an earlier version mixed same-topic and
 * merely-recent pieces under one heading and routinely listed things that had
 * nothing to do with the story.
 */
export async function getRelated(
  article: Article,
  limit = 4
): Promise<{ heading: string; articles: Article[] }> {
  const articles = await getArticles();

  const sameTopic = article.topic
    ? articles.filter((a) => a.slug !== article.slug && a.topic?.slug === article.topic!.slug)
    : [];

  if (sameTopic.length >= 2) {
    return { heading: `More on ${article.topic!.name}`, articles: sameTopic.slice(0, limit) };
  }

  return {
    heading: 'More from the newsroom',
    articles: articles.filter((a) => a.slug !== article.slug).slice(0, limit)
  };
}

/**
 * Commissioned pieces that have not been filed.
 *
 * These fill the foot of the Analysis & opinion river. Nothing renders them as
 * links: a headline that opens nothing is worse than a headline that says it
 * is not written yet.
 */
export const getPendingStories = async (): Promise<PendingStory[]> =>
  query<PendingStory[]>(Q.COMMISSIONED_QUERY);

/**
 * Oldest pieces first, for the rail beside Analysis & opinion.
 *
 * The rail is sized to hold `limit` items so the column reaches the foot of
 * the river. While the archive holds fewer pieces than the rail has slots the
 * list cycles, which is visible as a stopgap — the same headlines appear twice
 * in one column — and resolves itself with no code change as the archive grows.
 *
 * Callers must key on index, not slug: slugs repeat here.
 */
export const getArchive = async (limit = 4): Promise<Article[]> => {
  const pool = [...(await getArticles())].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  if (pool.length === 0) return [];
  return Array.from({ length: limit }, (_, i) => pool[i % pool.length]);
};

/* ---------------------------------------------------------------------------
   The front page's two columns
   ---------------------------------------------------------------------------
   Analysis & opinion and the archive rail beside it have to finish level, and
   they grow at very different rates: a river row is about 155px, a rail item
   about 52px. While the river took every article the page had left over, each
   new piece pushed it 155px further past the foot of the rail, and the only
   way to catch up was to repeat headlines in the rail — five of them, by the
   time the archive reached sixteen pieces.

   So the river is capped instead. The front page stops being a full index of
   everything published, which is what a front page is supposed to do; More →
   and All articles → carry the rest to /articles, and the rail still lists
   fourteen. Between them the page reaches every piece.

   Both numbers are measured rather than guessed. At sixteen articles, six rows
   against fourteen slots leaves the river 39px longer than the rail at 1440;
   fifteen slots overshot the other way by 69px. The residue is deliberately
   left on the rail's side, because 39px under a narrow column that ends in a
   pull quote reads as nothing, while the same gap under the main column is the
   first thing anyone notices.

   These were measured against the sixteen articles on the site at the time.
   Under the CMS the count moves whenever the newsroom publishes, so re-measure
   whenever it grows enough to change a row count.
--------------------------------------------------------------------------- */

/** Rows of Analysis & opinion on the front page. Paired with archiveCapacity. */
export const riverDepth = 6;

/** Slots the front-page rail is built to hold. See getArchive and riverDepth. */
export const archiveCapacity = 14;

/* ---------------------------------------------------------------------------
   Podcast
--------------------------------------------------------------------------- */

export const getEpisodes = async (): Promise<Episode[]> =>
  (await query<RawEpisode[]>(Q.EPISODES_QUERY)).map(hydrateEpisode);

/** Released, real episodes. What the podcast page lists and the player plays. */
export const getReleasedEpisodes = async (): Promise<Episode[]> =>
  (await query<RawEpisode[]>(Q.RELEASED_EPISODES_QUERY)).map(hydrateEpisode);

export const getLatestEpisode = async (): Promise<Episode | undefined> =>
  (await getReleasedEpisodes())[0];

export const getUpcoming = async (): Promise<UpcomingEpisode[]> =>
  query<UpcomingEpisode[]>(Q.UPCOMING_EPISODES_QUERY);

/** Default true: an episode is watchable unless it has been withdrawn. */
export const canWatch = (e: Episode): boolean => e.videoAvailable !== false && Boolean(e.youtubeId);

export const getPodcastShow = async (): Promise<PodcastShow> => {
  const show = await query<PodcastShow | null>(Q.PODCAST_SHOW_QUERY);
  const id = show?.spotifyShowId;
  return {
    title: show?.title ?? 'The Nile Explorer Podcast',
    tagline: show?.tagline,
    blurb: show?.blurb,
    spotifyShowId: id,
    rssFeed: show?.rssFeed,
    appleUrl: show?.appleUrl,
    spotifyUrl: id ? `https://open.spotify.com/show/${id}` : null,
    spotifyEmbed: id ? `https://open.spotify.com/embed/show/${id}?theme=0` : null
  };
};

export type PlayerEpisode = {
  number: number;
  title: string;
  /** Null while withdrawn: the YouTube thumbnail URL carries the video id. */
  thumbnail: string | null;
  videoAvailable: boolean;
  videoNote?: string;
  stills: Image[];
  photographer?: string;
  /** Null while the video is withdrawn, so the URL never reaches the client. */
  url: string | null;
  embed: string | null;
};

/**
 * Narrow an episode to what the player needs.
 *
 * The player is a client component, so whatever it receives is serialized into
 * the RSC payload and readable in page source. Passing the whole episode
 * leaked the video URL even with every link to it removed.
 */
export function toPlayerEpisode(e: Episode): PlayerEpisode {
  const watchable = canWatch(e);
  return {
    number: e.number,
    title: e.title,
    thumbnail: watchable ? e.thumbnail : null,
    videoAvailable: watchable,
    videoNote: e.videoNote,
    stills: e.stills,
    photographer: e.photographer,
    url: watchable ? e.url : null,
    embed: watchable ? e.embed : null
  };
}

/* ---------------------------------------------------------------------------
   Podcast episodes for the banner strip
   ---------------------------------------------------------------------------
   The band carries three episodes, real and announced alike, normalised to one
   shape so the strip does not have to know which is which. Anything not yet
   released gets no link, because there is nothing to open.
--------------------------------------------------------------------------- */

export type BannerEpisode = {
  number: number;
  title: string;
  blurb: string;
  date: string;
  thumbnail: string | null;
  thumbnailAlt: string;
  guests: Guest[];
  published: boolean;
};

/**
 * Strip a trailing "Episode N" from a title.
 *
 * Kept for titles imported from YouTube, where the number was part of the
 * upload name and the band prints it as a kicker directly above — which read
 * as a typo. New episodes carry the number in its own field, so this is a
 * no-op for anything created in the Studio.
 */
const trimEpisodeSuffix = (title: string): string =>
  title.replace(/[.\s—–-]*\s*Episode\s+\d+\s*$/i, '').trim() || title;

export const getBannerEpisodes = async (count = 3): Promise<BannerEpisode[]> =>
  (await getEpisodes()).slice(0, count).map((e) => ({
    number: e.number,
    title: trimEpisodeSuffix(e.title),
    blurb: e.blurb,
    date: e.published,
    thumbnail: e.stills[0]?.url ?? e.thumbnail,
    thumbnailAlt: e.stills[0]?.alt ?? `Artwork for “${e.title}”`,
    guests: e.guests ?? [],
    published: e.state === 'published' && !e.placeholder
  }));

/* ---------------------------------------------------------------------------
   Documentaries, strands and the singletons
--------------------------------------------------------------------------- */

type RawFilm = Omit<Film, 'poster'> & { poster: SanityImage | null };

export const getDocumentaries = async (): Promise<Film[]> =>
  (await query<RawFilm[]>(Q.FILMS_QUERY)).map((f) => ({ ...f, poster: toImage(f.poster) }));

export const getStrands = async (): Promise<Strand[]> => query<Strand[]>(Q.STRANDS_QUERY);

export const getStrand = async (slug: string): Promise<Strand | undefined> =>
  (await getStrands()).find((s) => s.slug === slug);

/** Articles filed under a strand, via the topic it is fed by. */
export const getStrandArticles = async (strand: Strand): Promise<Article[]> =>
  strand.topic ? (await getArticles()).filter((a) => a.topic?.slug === strand.topic) : [];

type RawFestival = Omit<Festival, 'slides'> & { slides: SanityImage[] | null };

export const getFestival = async (): Promise<Festival> => {
  const f = await query<RawFestival | null>(Q.FESTIVAL_QUERY);
  return {
    name: f?.name ?? 'The Nile Festival',
    standfirst: f?.standfirst ?? '',
    blurb: f?.blurb ?? '',
    foundationBody: f?.foundationBody,
    editorialNote: f?.editorialNote,
    datesAnnounced: f?.datesAnnounced ?? false,
    dates: f?.dates,
    strands: f?.strands ?? [],
    awards: f?.awards,
    slides: (f?.slides ?? []).map(toImage).filter((i): i is Image => i !== null)
  };
};

type RawAbout = Omit<AboutPage, 'patron'> & {
  patron?: (Author & { bio?: PortableTextBlock[]; portrait: SanityImage | null }) | null;
};

export const getAboutPage = async (): Promise<AboutPage> => {
  const a = await query<RawAbout | null>(Q.ABOUT_PAGE_QUERY);
  return {
    ...a,
    intro: a?.intro ?? [],
    themes: a?.themes ?? [],
    publicationBody: a?.publicationBody ?? [],
    patron: a?.patron ? { ...a.patron, portrait: toImage(a.patron.portrait) } : undefined
  };
};

/**
 * The masthead, the menu, the footer and the site's own description.
 *
 * Was a hardcoded `SITE` constant. The fallbacks below exist so a missing or
 * half-filled Site settings document degrades to something sensible rather
 * than crashing the build — but they are a safety net, not the source: what
 * ships is whatever is in the Studio.
 */
export const getSite = async (): Promise<SiteSettings> => {
  const s = await query<SiteSettings | null>(Q.SITE_SETTINGS_QUERY);
  return {
    name: s?.name ?? 'The Nile Explorer',
    tagline: s?.tagline ?? 'The Mirror of Africa',
    description: s?.description ?? '',
    url: s?.url ?? 'https://nilexplorer.net',
    email: s?.email ?? '',
    youtube: s?.youtube,
    youtubeHandle: s?.youtubeHandle,
    instagram: s?.instagram,
    instagramHandle: s?.instagramHandle,
    newsletterAction: s?.newsletterAction,
    patron: s?.patron,
    pullQuote: s?.pullQuote,
    nav: s?.nav ?? []
  };
};

/* ---------------------------------------------------------------------------
   Formatting
--------------------------------------------------------------------------- */

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatShortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
