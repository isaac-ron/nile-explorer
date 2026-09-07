/**
 * Content access layer.
 *
 * Reads the JSON produced by `npm run ingest`. Everything is static at build
 * time, so pages can be fully prerendered. When the CMS lands, only this file
 * changes: the page components consume these types, not the JSON shape.
 */

import articlesJson from '../../content/articles.json';
import categoriesJson from '../../content/categories.json';
import podcastJson from '../../content/podcast.json';
import televisionJson from '../../content/television.json';
import festivalJson from '../../content/festival.json';
import podcastMetaJson from '../../content/podcast-meta.json';

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
  category: { name: string; slug: string };
  author: string;
  image: Image | null;
  blocks: Block[];
  summary: string;
  readingTime: number;
  source: string;
};

export type Category = { name: string; slug: string; count: number };

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

export type EpisodeMeta = {
  blurb?: string;
  topics?: string[];
  guests?: Guest[];
};

export type UpcomingEpisode = {
  title: string;
  blurb?: string;
  topics?: string[];
  guests?: Guest[];
  releaseDate?: string;
};

export type PodcastMeta = {
  show: { tagline: string; blurb: string };
  episodes: Record<string, EpisodeMeta>;
  upcoming: UpcomingEpisode[];
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
const categories = categoriesJson as Category[];
const podcast = podcastJson as Podcast;
const television = televisionJson as Video[];
const festival = festivalJson as Festival;
const podcastMeta = podcastMetaJson as unknown as PodcastMeta;

export const getArticles = (): Article[] => articles;

export const getArticle = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

export const getCategories = (): Category[] => categories;

export const getArticlesByCategory = (slug: string): Article[] =>
  articles.filter((a) => a.category.slug === slug);

export const getPodcast = (): Podcast => podcast;

export const getPodcastMeta = (): PodcastMeta => podcastMeta;

/** Episodes with guests, topics and a hand-written blurb folded in where present. */
export const getEpisodes = (): EpisodeWithMeta[] =>
  podcast.episodes.map((e) => ({ ...e, ...(podcastMeta.episodes[e.videoId] ?? {}) }));

export const getLatestEpisode = (): EpisodeWithMeta | undefined => getEpisodes()[0];

/** Scheduled but unreleased. Empty until someone fills in podcast-meta.json. */
export const getUpcoming = (): UpcomingEpisode[] => podcastMeta.upcoming;

export const getTelevision = (): Video[] => television;

export const getFestival = (): Festival => festival;

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
  const sameCategory = articles.filter(
    (a) => a.slug !== article.slug && a.category.slug === article.category.slug
  );

  if (sameCategory.length >= 2) {
    return {
      heading: `More in ${article.category.name}`,
      articles: sameCategory.slice(0, limit)
    };
  }

  return {
    heading: 'More from the newsroom',
    articles: articles.filter((a) => a.slug !== article.slug).slice(0, limit)
  };
}

/**
 * Oldest pieces, for a sidebar that does not simply repeat the front page.
 * Deliberately not "Most read": there is no analytics source behind this site
 * yet, so a popularity ranking would be invented.
 */
export const getArchive = (limit = 4): Article[] =>
  [...articles].sort((a, b) => +new Date(a.date) - +new Date(b.date)).slice(0, limit);

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
