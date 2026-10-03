import type { MetadataRoute } from 'next';
import { getSite } from '@/lib/content';

/**
 * /robots.txt. Everything readers see is open to crawlers. The Studio and the
 * route handlers are not pages, and a crawler posting to /api/track would be
 * ignored anyway.
 */
export const revalidate = 900;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] },
    sitemap: new URL('/sitemap.xml', site.url).toString(),
    host: site.url
  };
}
