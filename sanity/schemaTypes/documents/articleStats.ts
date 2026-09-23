import { defineType, defineField } from 'sanity';
import { ChartUpwardIcon } from '../../icons';

/**
 * How much an article is being read and shared.
 *
 * Written only by the site (/api/track), one document per article, and never
 * edited by hand: the whole type is read-only in the Studio and cannot be
 * created from the menu. The front page ranks its Top stories on these; see
 * getFrontPage in src/lib/content.ts.
 *
 * It is not in the publish webhook's type list, on purpose — a page view is
 * not a publish, and must not flush the site's cache.
 */
export default defineType({
  name: 'articleStats',
  title: 'Readership',
  type: 'document',
  icon: ChartUpwardIcon,
  readOnly: true,
  fields: [
    defineField({
      name: 'article',
      title: 'Article',
      type: 'reference',
      to: [{ type: 'article' }],
      weak: true
    }),
    defineField({ name: 'views', title: 'Reads, all time', type: 'number' }),
    defineField({ name: 'shares', title: 'Shares, all time', type: 'number' }),
    defineField({
      name: 'days',
      title: 'By day',
      type: 'object',
      // Keys are written by the site (d20260923 …) and cannot be declared in
      // advance, so the field is hidden rather than shown with an "unknown
      // fields" warning an editor can do nothing about. The last 30 days are
      // kept; the front page ranks on the most recent fortnight.
      hidden: true,
      fields: [defineField({ name: 'note', type: 'string' })]
    })
  ],
  orderings: [
    { title: 'Most read', name: 'viewsDesc', by: [{ field: 'views', direction: 'desc' }] },
    { title: 'Most shared', name: 'sharesDesc', by: [{ field: 'shares', direction: 'desc' }] }
  ],
  preview: {
    select: { title: 'article.title', views: 'views', shares: 'shares', media: 'article.image' },
    prepare: ({ title, views, shares, media }) => ({
      title: title ?? 'Deleted article',
      subtitle: `${views ?? 0} reads · ${shares ?? 0} shares`,
      media
    })
  }
});
