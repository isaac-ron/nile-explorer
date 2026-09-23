import { defineType, defineField } from 'sanity';
import { placeholderField, placeholderSubtitle } from '../placeholder';
import { DocumentTextIcon } from '../../icons';

/**
 * A piece of writing.
 *
 * Covers both published articles and commissioned ones that have not been
 * filed yet. The old site kept those in two separate files; here they are one
 * type with a `state` field, which is one fewer thing for an editor to learn.
 *
 * A commissioned piece appears on the front page as a headline with "In
 * production" beside it and no link, because a headline that opens nothing is
 * worse than one that says it is not written yet. It is kept out of /articles,
 * the sitemap, the topic counts and the related-story lists by filtering on
 * `state` in the queries — see src/lib/sanity/queries.ts.
 */
export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'filing', title: 'Filing' },
    { name: 'promotion', title: 'Front page' }
  ],
  fields: [
    defineField({
      name: 'state',
      title: 'Stage',
      type: 'string',
      group: 'filing',
      initialValue: 'published',
      description:
        'Choose "Commissioned" for a piece that has been assigned but not written. It appears ' +
        'on the front page as a headline with its status beside it, and cannot be opened. ' +
        'Switch to "Ready to publish" once the body is written.',
      options: {
        list: [
          { title: 'Ready to publish', value: 'published' },
          { title: 'Commissioned — not written yet', value: 'commissioned' }
        ],
        layout: 'radio'
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description:
        'The headline as it appears on the page and in search results. Sentence case, no full ' +
        'stop at the end.',
      validation: (rule) => rule.required().error('An article needs a headline.')
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'content',
      description:
        'The last part of the article\'s address, generated from the headline. Press Generate ' +
        'after writing the headline. Once a piece is published, changing this breaks every ' +
        'existing link to it — including ones already shared on WhatsApp — so leave it alone.',
      options: { source: 'title', maxLength: 80 },
      validation: (rule) => rule.required().error('Press Generate to create the web address.')
    }),
    defineField({
      name: 'standfirst',
      title: 'Standfirst',
      type: 'text',
      rows: 3,
      group: 'content',
      description:
        'One or two sentences under the headline. Also used as the blurb on cards and as the ' +
        'description shown when the article is shared or found in search. Aim for 20–35 words.',
      validation: (rule) =>
        rule.required().min(40).max(300).error('Write a standfirst of one or two sentences.')
    }),
    defineField({
      name: 'author',
      title: 'Byline',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'filing',
      description: 'Who wrote it. Add a new writer under Newsroom → Writers first.',
      validation: (rule) => rule.required().error('Every article needs a byline.')
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publication date',
      type: 'datetime',
      group: 'filing',
      description:
        'When the piece was — or will be — published. Articles are listed newest first by this ' +
        'date, and the three newest make up Latest on the front page.',
      validation: (rule) => rule.required().error('Set a publication date.')
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      group: 'filing',
      initialValue: 'Opinion',
      description:
        'What kind of piece this is. Everything published so far is Opinion — commentary by the ' +
        'patron. Use News for sourced reporting.',
      options: {
        list: [
          { title: 'Opinion', value: 'Opinion' },
          { title: 'News', value: 'News' },
          { title: 'Analysis', value: 'Analysis' },
          { title: 'Feature', value: 'Feature' }
        ]
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'reference',
      to: [{ type: 'topic' }],
      group: 'filing',
      description:
        'What the piece is about — Peace, Geo-politics, Educational and so on. Printed as the ' +
        'small line above the headline, and used to gather related pieces. Optional, but a ' +
        'piece without one falls back to showing its section instead.'
    }),
    defineField({
      name: 'dateline',
      title: 'Dateline',
      type: 'string',
      group: 'filing',
      description:
        'The city the piece was filed from, printed above the body — Juba, Nairobi, London. ' +
        'Leave empty if it was not filed from anywhere in particular.'
    }),
    defineField({
      name: 'image',
      title: 'Lead image',
      type: 'figure',
      group: 'content',
      description:
        'The picture at the top of the article, also used on cards and when the piece is shared. ' +
        'Landscape works best — roughly 3:2. Its description becomes the caption.'
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      group: 'content',
      description:
        'The article itself. Use Heading for section breaks and Pull quote for a quotation you ' +
        'want set apart. Links and bold work as you would expect.',
      // Only demanded once the piece is actually being published, so a
      // commissioned headline can be saved with nothing written yet.
      validation: (rule) =>
        rule.custom((value, context) => {
          const state = (context.document as { state?: string } | undefined)?.state;
          if (state === 'commissioned') return true;
          return Array.isArray(value) && value.length > 0
            ? true
            : 'Write the article, or set the stage to "Commissioned" if it is not written yet.';
        })
    }),
    defineField({
      name: 'weight',
      title: 'Pin to Top stories',
      type: 'number',
      group: 'promotion',
      description:
        'Leave empty — this is the normal case. A new piece goes into Latest on the front page ' +
        'by itself, and Top stories are chosen automatically by how much each piece is being ' +
        'read and shared. Set a number only to force a piece into Top stories regardless: higher ' +
        'wins, and the highest becomes the lead. Clear it once the piece has had its run.',
      validation: (rule) => rule.min(0).max(100)
    }),
    placeholderField
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    },
    { title: 'Headline A–Z', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] }
  ],
  preview: {
    select: {
      title: 'title',
      date: 'publishedAt',
      state: 'state',
      author: 'author.name',
      media: 'image',
      placeholder: 'placeholder'
    },
    prepare: ({ title, date, state, author, media, placeholder }) => {
      const when = date ? new Date(date).toLocaleDateString('en-GB') : 'no date';
      const stage = state === 'commissioned' ? 'Commissioned' : when;
      return {
        title,
        subtitle: placeholderSubtitle(placeholder, `${stage} · ${author ?? 'no byline'}`),
        media
      };
    }
  }
});
