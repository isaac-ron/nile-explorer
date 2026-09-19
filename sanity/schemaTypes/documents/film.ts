import { defineType, defineField } from 'sanity';
import { placeholderField, placeholderSubtitle } from '../placeholder';
import { VideoIcon } from '../../icons';

/**
 * A documentary.
 *
 * The strand was called Television and drew from the YouTube feed, which held
 * a live-stream test, two podcast repackages and two third-party speeches —
 * none of them a documentary. It is a curated list now.
 *
 * All three films currently in here are placeholders with AI-generated key
 * art, flagged as such and unpublishable until that is replaced.
 */
export default defineType({
  name: 'film',
  title: 'Documentary',
  type: 'document',
  icon: VideoIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The film\'s title on its own, without the subtitle.',
      validation: (rule) => rule.required().error('A film needs a title.')
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'Press Generate after entering the title.',
      options: { source: 'title', maxLength: 80 },
      validation: (rule) => rule.required().error('Press Generate to create the web address.')
    }),
    defineField({
      name: 'standfirst',
      title: 'Subtitle',
      type: 'string',
      description: 'The line under the title, e.g. "The Land of Hope". A few words.',
      validation: (rule) => rule.required().error('A film needs a subtitle.')
    }),
    defineField({
      name: 'summary',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'One or two sentences on what the film is about.',
      validation: (rule) => rule.required().min(30).error('Write a short description.')
    }),
    defineField({
      name: 'poster',
      title: 'Key art',
      type: 'figure',
      description:
        'The film\'s poster image. Square works best — it is shown as a square card. Must be a ' +
        'real photograph or commissioned artwork.',
      validation: (rule) => rule.required().error('A film needs key art.')
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'In development',
      description:
        'Printed on the card so nobody expects to watch something that does not exist yet.',
      options: {
        list: [
          { title: 'In development', value: 'In development' },
          { title: 'In production', value: 'In production' },
          { title: 'In post-production', value: 'In post-production' },
          { title: 'Released', value: 'Released' }
        ]
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'order',
      title: 'Position',
      type: 'number',
      description: 'Films are shown lowest number first. Leave empty to sort by title.'
    }),
    placeholderField
  ],
  orderings: [{ title: 'Position', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: {
      title: 'title',
      standfirst: 'standfirst',
      status: 'status',
      media: 'poster',
      placeholder: 'placeholder'
    },
    prepare: ({ title, standfirst, status, media, placeholder }) => ({
      title,
      subtitle: placeholderSubtitle(placeholder, `${standfirst ?? ''} · ${status ?? ''}`),
      media
    })
  }
});
