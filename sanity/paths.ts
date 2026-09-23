/**
 * Where a document is seen on the site.
 *
 * Used by the Preview and "Publish & view" buttons and by the Home dashboard.
 * Must agree with the routes under src/app/(site): add a type there with its
 * own page and it wants a line here, or those buttons will not appear on it.
 *
 * Returns null for anything with no page of its own (topics), and for a
 * document whose web address has not been generated yet.
 */
type Doc = { _type: string; slug?: { current?: string } | null };

export function pathFor(doc: Doc | null | undefined): string | null {
  if (!doc) return null;
  const slug = doc.slug?.current;
  switch (doc._type) {
    case 'article':
      return slug ? `/articles/${slug}` : null;
    case 'author':
      return slug ? `/writers/${slug}` : null;
    case 'strand':
      return slug ? `/more/${slug}` : null;
    case 'episode':
    case 'podcastShow':
      return '/podcasts';
    case 'film':
      return '/documentaries';
    case 'festival':
      return '/festival';
    case 'aboutPage':
      return '/about';
    case 'siteSettings':
      return '/';
    default:
      return null;
  }
}
