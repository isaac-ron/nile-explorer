import type { MetadataRoute } from 'next';
import { getArticleSitemap, getSite, getStrands, getWriters, writerHref } from '@/lib/content';

/**
 * /sitemap.xml, for search engines.
 *
 * Built from the same published-content queries as the pages, so it carries
 * the same cache tag: a publish expires it along with everything else, and it
 * regenerates on the 15-minute schedule regardless. Only pages a reader can
 * open are listed. Commissioned pieces have no page and are left out.
 */
export const revalidate = 900;

const SECTIONS = ['/articles', '/podcasts', '/documentaries', '/festival', '/about', '/more', '/writers'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, articles, writers, strands] = await Promise.all([
    getSite(),
    getArticleSitemap(),
    getWriters(),
    getStrands()
  ]);
  const at = (path: string) => new URL(path, site.url).toString();

  return [
    { url: at('/'), changeFrequency: 'hourly', priority: 1 },
    ...SECTIONS.map((path) => ({ url: at(path), changeFrequency: 'daily' as const, priority: 0.7 })),
    ...strands.map((s) => ({ url: at(`/more/${s.slug}`), changeFrequency: 'weekly' as const, priority: 0.5 })),
    ...writers.map((w) => ({ url: at(writerHref(w)), changeFrequency: 'weekly' as const, priority: 0.5 })),
    ...articles.map((a) => ({
      url: at(`/articles/${a.slug}`),
      lastModified: a.updated,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))
  ];
}
