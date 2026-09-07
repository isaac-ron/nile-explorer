/**
 * Content access layer.
 *
 * Reads the JSON produced by `npm run ingest`. Everything is static at build
 * time, so pages can be fully prerendered. When the CMS lands, only this file
 * changes: the page components consume these types, not the JSON shape.
 */

import articlesJson from '../../content/articles.json';
import categoriesJson from '../../content/categories.json';
import episodesJson from '../../content/episodes.json';

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

export type Episode = {
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

const articles = articlesJson as Article[];
const categories = categoriesJson as Category[];
const episodes = episodesJson as Episode[];

export const getArticles = (): Article[] => articles;

export const getArticle = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

export const getCategories = (): Category[] => categories;

export const getArticlesByCategory = (slug: string): Article[] =>
  articles.filter((a) => a.category.slug === slug);

export const getEpisodes = (): Episode[] =>
  [...episodes].sort((a, b) => +new Date(b.published) - +new Date(a.published));

export const getLatestEpisode = (): Episode | undefined => getEpisodes()[0];

/** Same category first, then most recent, excluding the article itself. */
export function getRelated(article: Article, limit = 4): Article[] {
  const others = articles.filter((a) => a.slug !== article.slug);
  const sameCat = others.filter((a) => a.category.slug === article.category.slug);
  const rest = others.filter((a) => a.category.slug !== article.category.slug);
  return [...sameCat, ...rest].slice(0, limit);
}

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
  email: 'newsroom@nilexplorer.net',
  patron: 'Dr. Aldo Ajou Deng-Akuey'
} as const;
