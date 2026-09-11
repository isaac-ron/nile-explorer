import { defineType, defineField } from 'sanity';

/**
 * A subject an article can be filed under.
 *
 * Note there is no article count stored here. The old JSON carried one and it
 * went stale the moment anything was published; the site counts articles as it
 * queries them instead.
 */
export default defineType({
  name: 'topic',
  title: 'Topic',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description:
        'As printed above headlines and in the footer — "Peace", "Geo-politics". Keep it short; ' +
        'it sits in a small line of type.',
      validation: (rule) => rule.required().error('A topic needs a name.')
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description:
        'The last part of the topic\'s address. Press Generate after entering the name. ' +
        'Changing it later breaks any link already shared to that topic page.',
      options: { source: 'name', maxLength: 60 },
      validation: (rule) => rule.required().error('Press Generate to create the web address.')
    })
  ],
  preview: {
    select: { title: 'name', subtitle: 'slug.current' }
  }
});
