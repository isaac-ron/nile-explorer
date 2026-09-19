import { defineType, defineField } from 'sanity';
import { MasterDetailIcon } from '../../icons';

/**
 * A coverage area behind the More menu.
 *
 * These mirror the Nile Festival's pillars. None of them holds an article yet;
 * the pages exist so the menu is real and the newsroom has somewhere to
 * publish into, and each shows an honest empty state until it does.
 *
 * Linking a strand to a topic is what fills it: tag an article with that topic
 * and it appears here, with nothing else to do.
 */
export default defineType({
  name: 'strand',
  title: 'Strand',
  type: 'document',
  icon: MasterDetailIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'As shown in the More menu and as the page heading — "Cultural commentary".',
      validation: (rule) => rule.required().error('A strand needs a name.')
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'Press Generate after entering the name.',
      options: { source: 'name', maxLength: 60 },
      validation: (rule) => rule.required().error('Press Generate to create the web address.')
    }),
    defineField({
      name: 'standfirst',
      title: 'Description',
      type: 'text',
      rows: 3,
      description:
        'A sentence under the heading saying what the strand covers. Also used as the page\'s ' +
        'description in search results.',
      validation: (rule) => rule.required().min(30).error('Write a short description.')
    }),
    defineField({
      name: 'topic',
      title: 'Fed by topic',
      type: 'reference',
      to: [{ type: 'topic' }],
      description:
        'Articles tagged with this topic appear on the strand page automatically. Leave empty ' +
        'and the strand stays empty.'
    }),
    defineField({
      name: 'order',
      title: 'Position in the menu',
      type: 'number',
      description: 'Lowest number first. Leave empty to sort by name.'
    })
  ],
  orderings: [{ title: 'Menu order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'standfirst' }
  }
});
