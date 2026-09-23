import { groq } from 'next-sanity';

/**
 * Every GROQ query the site runs, in one file.
 *
 * Two conventions worth knowing before editing these.
 *
 * `state == "published"` appears on most article queries deliberately.
 * Commissioned pieces — headlines assigned but not written — are real
 * documents, and they belong on the front page as "in production" rows. They
 * do not belong in /articles, the sitemap, the topic counts or the
 * related-story lists, because none of those can offer a reader anything to
 * open. One query type, filtered per use.
 *
 * Counts are computed, never stored. The old JSON carried an article count on
 * each topic and it was wrong the moment anything was published.
 */

/**
 * Shared image projection: URL plus the dimensions next/image needs.
 *
 * `alt` and `caption` are both selected and are not the same thing. alt
 * describes the frame for a screen reader and is never printed; caption is
 * written to be read under the picture. Printing one as the other is what the
 * site used to do.
 */
const IMAGE = groq`{
  alt,
  caption,
  credit,
  asset->{ url, metadata { dimensions { width, height } } }
}`;

/**
 * Shared body projection for every blockContent field.
 *
 * Projecting `body` bare returns a picture's asset as an unresolved `_ref`,
 * which costs the renderer the file's real dimensions — and those are what set
 * the frame's ratio and its upscaling ceiling. Spread everything, then
 * dereference the asset on figures only.
 *
 * Use this anywhere a blockContent field is selected. A bare field name works
 * right up until someone puts a picture in that field.
 */
const BODY = groq`[]{
  ...,
  _type == "figure" => {
    ...,
    asset->{ url, metadata { dimensions { width, height } } }
  }
}`;

const ARTICLE_FIELDS = groq`
  "id": _id,
  "slug": slug.current,
  title,
  "date": publishedAt,
  state,
  section,
  dateline,
  weight,
  "summary": standfirst,
  topic->{ name, "slug": slug.current },
  author->{ name, role, colophon, isPatron, "slug": slug.current },
  image ${IMAGE}
`;

/** Published articles, newest first. The site's spine. */
export const ARTICLES_QUERY = groq`
  *[_type == "article" && state == "published" && !placeholder]
  | order(publishedAt desc) {
    ${ARTICLE_FIELDS},
    "body": body ${BODY}
  }
`;

export const ARTICLE_BY_SLUG_QUERY = groq`
  *[_type == "article" && slug.current == $slug && state == "published"][0] {
    ${ARTICLE_FIELDS},
    "body": body ${BODY}
  }
`;

/** Slugs to prerender. Commissioned pieces are excluded: they have no page. */
export const ARTICLE_SLUGS_QUERY = groq`
  *[_type == "article" && state == "published" && defined(slug.current)].slug.current
`;

/**
 * Assigned but unwritten. Rendered as a headline with its status beside it and
 * no link, because a headline that opens nothing is worse than one that admits
 * it is not written yet.
 */
export const COMMISSIONED_QUERY = groq`
  *[_type == "article" && state == "commissioned"] | order(publishedAt desc) {
    "slug": slug.current,
    title,
    "standfirst": standfirst,
    "topic": topic->name,
    "author": author->name,
    "status": "In production"
  }
`;

/**
 * Every writer with at least one published piece, for /writers.
 *
 * `slug` can be null on a writer created before the field existed; the content
 * layer derives one from the name so a missing slug never costs a writer their
 * page.
 */
export const AUTHORS_QUERY = groq`
  *[_type == "author" && !(_id in path("drafts.**"))] {
    "id": _id,
    name,
    "slug": slug.current,
    role,
    colophon,
    isPatron,
    "bio": bio ${BODY},
    "portrait": portrait ${IMAGE},
    "count": count(*[_type == "article" && state == "published" && !placeholder && references(^._id)])
  }[count > 0] | order(isPatron desc, count desc, name asc)
`;

/**
 * Readership counters, one document per article that has been read.
 *
 * Written by /api/track, never by an editor, and kept out of the Studio menu.
 * `days` holds one bucket per day so the ranking can ask what is being read
 * now rather than what has been read ever; see getTopStories.
 */
export const STATS_QUERY = groq`
  *[_type == "articleStats"] { "article": article._ref, views, shares, days }
`;

/** Resolves a slug from the tracker to the article it counts against. */
export const ARTICLE_ID_BY_SLUG_QUERY = groq`
  *[_type == "article" && slug.current == $slug && state == "published" && !placeholder][0]._id
`;

/** Topics that actually hold something, most-used first. */
export const TOPICS_QUERY = groq`
  *[_type == "topic"] {
    name,
    "slug": slug.current,
    "count": count(*[_type == "article" && state == "published" && references(^._id)])
  }[count > 0] | order(count desc)
`;

/** Sections in use, derived from the articles rather than kept as a list. */
export const SECTIONS_QUERY = groq`
  *[_type == "article" && state == "published"].section
`;

const EPISODE_FIELDS = groq`
  "id": _id,
  number,
  title,
  "slug": slug.current,
  "published": publishedAt,
  state,
  blurb,
  youtubeId,
  "videoAvailable": coalesce(videoAvailable, true),
  videoNote,
  photographer,
  "placeholder": coalesce(placeholder, false),
  guests[]{ name, role },
  topics,
  stills[] ${IMAGE}
`;

/**
 * Episodes, newest first.
 *
 * Placeholders are included here, unlike articles: the front-page band is
 * built to show them as unlinked "coming soon" cards, which is the honest
 * rendering of an episode that has not been recorded. They can never be
 * published — the schema blocks it — so nothing here claims they are real.
 */
export const EPISODES_QUERY = groq`
  *[_type == "episode"] | order(number desc) { ${EPISODE_FIELDS} }
`;

export const RELEASED_EPISODES_QUERY = groq`
  *[_type == "episode" && state == "published" && !placeholder]
  | order(number desc) { ${EPISODE_FIELDS} }
`;

export const UPCOMING_EPISODES_QUERY = groq`
  *[_type == "episode" && state == "upcoming"] | order(publishedAt asc) {
    title, blurb, topics, guests[]{ name, role }, "releaseDate": publishedAt
  }
`;

export const FILMS_QUERY = groq`
  *[_type == "film"] | order(coalesce(order, 99) asc, title asc) {
    "slug": slug.current,
    title,
    standfirst,
    summary,
    status,
    "placeholder": coalesce(placeholder, false),
    "poster": poster ${IMAGE}
  }
`;

export const STRANDS_QUERY = groq`
  *[_type == "strand"] | order(coalesce(order, 99) asc, name asc) {
    "slug": slug.current,
    name,
    standfirst,
    "topic": topic->slug.current
  }
`;

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    name,
    tagline,
    description,
    url,
    email,
    youtube,
    youtubeHandle,
    instagram,
    instagramHandle,
    newsletterAction,
    patron->{ name, role },
    pullQuote{ text, attribution },
    nav[]{ label, href, expandStrands }
  }
`;

export const ABOUT_PAGE_QUERY = groq`
  *[_type == "aboutPage"][0] {
    "intro": intro ${BODY},
    patronKicker,
    patronRole,
    editorialNote,
    themesHeading,
    themes[]{ name, detail },
    publicationHeading,
    "publicationBody": publicationBody ${BODY},
    contactBlurb,
    correctionsNote,
    "patron": *[_type == "author" && isPatron == true][0] {
      name, "slug": slug.current, role, colophon, "bio": bio ${BODY}, "portrait": portrait ${IMAGE}
    }
  }
`;

export const FESTIVAL_QUERY = groq`
  *[_type == "festival"][0] {
    name,
    standfirst,
    blurb,
    "foundationBody": foundationBody ${BODY},
    editorialNote,
    "datesAnnounced": coalesce(datesAnnounced, false),
    dates,
    strands[]{ name, detail },
    awards{ name, detail },
    slides[] ${IMAGE}
  }
`;

export const PODCAST_SHOW_QUERY = groq`
  *[_type == "podcastShow"][0] {
    title, tagline, blurb, spotifyShowId, rssFeed, appleUrl
  }
`;
