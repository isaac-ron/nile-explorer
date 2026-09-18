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

/** Shared image projection: URL plus the dimensions next/image needs. */
const IMAGE = groq`{
  alt,
  credit,
  asset->{ url, metadata { dimensions { width, height } } }
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
  author->{ name, role, colophon, isPatron },
  image ${IMAGE}
`;

/** Published articles, newest first. The site's spine. */
export const ARTICLES_QUERY = groq`
  *[_type == "article" && state == "published" && !placeholder]
  | order(publishedAt desc) {
    ${ARTICLE_FIELDS},
    body
  }
`;

export const ARTICLE_BY_SLUG_QUERY = groq`
  *[_type == "article" && slug.current == $slug && state == "published"][0] {
    ${ARTICLE_FIELDS},
    body
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
    intro,
    patronKicker,
    patronRole,
    editorialNote,
    themesHeading,
    themes[]{ name, detail },
    publicationHeading,
    publicationBody,
    contactBlurb,
    correctionsNote,
    "patron": *[_type == "author" && isPatron == true][0] {
      name, role, colophon, bio, "portrait": portrait ${IMAGE}
    }
  }
`;

export const FESTIVAL_QUERY = groq`
  *[_type == "festival"][0] {
    name,
    standfirst,
    blurb,
    foundationBody,
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
