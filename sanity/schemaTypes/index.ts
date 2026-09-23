import type { SchemaTypeDefinition } from 'sanity';

import blockContent from './objects/blockContent';
import figure from './objects/figure';
import guest from './objects/guest';
import namedDetail from './objects/namedDetail';
import navItem from './objects/navItem';

import article from './documents/article';
import articleStats from './documents/articleStats';
import author from './documents/author';
import episode from './documents/episode';
import film from './documents/film';
import strand from './documents/strand';
import topic from './documents/topic';

import aboutPage from './singletons/aboutPage';
import festival from './singletons/festival';
import podcastShow from './singletons/podcastShow';
import siteSettings from './singletons/siteSettings';

/** Documents that must exist exactly once. See sanity/structure.ts. */
export const SINGLETONS = ['siteSettings', 'aboutPage', 'festival', 'podcastShow'] as const;

/** Written by the site, never by an editor: no "create", no edit, no delete. */
export const SYSTEM_TYPES = ['articleStats'] as const;

export const schemaTypes: SchemaTypeDefinition[] = [
  // Building blocks, used inside the documents below.
  blockContent,
  figure,
  guest,
  namedDetail,
  navItem,

  // Things there are many of.
  article,
  articleStats,
  author,
  topic,
  episode,
  film,
  strand,

  // Things there is one of.
  siteSettings,
  aboutPage,
  festival,
  podcastShow
];
