import { defineType, defineField } from 'sanity';

/**
 * One entry in the top navigation.
 *
 * Kept deliberately simple: a label and a path. The "More" menu's children are
 * not listed here — they are generated from the Strands, so adding a strand
 * adds a menu entry with nothing to remember.
 */
export default defineType({
  name: 'navItem',
  title: 'Menu item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'The word shown in the menu. Keep it to one word where possible.',
      validation: (rule) => rule.required().error('A menu item needs a label.')
    }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description:
        'Where it goes, as a path starting with a slash — /articles, /podcasts, /about. ' +
        'Check the link works after saving; a typo here produces a "page not found".',
      validation: (rule) =>
        rule
          .required()
          .regex(/^\/[^\s]*$/, { name: 'path' })
          .error('Start the link with a slash, e.g. /articles')
    }),
    defineField({
      name: 'expandStrands',
      title: 'Show the strands underneath',
      type: 'boolean',
      initialValue: false,
      description:
        'Turns this into a drop-down listing every strand (Culture, Media, Sport and so on). ' +
        'Used for the "More" menu. Leave off for ordinary links.'
    })
  ],
  preview: {
    select: { title: 'label', subtitle: 'href', expand: 'expandStrands' },
    prepare: ({ title, subtitle, expand }) => ({
      title,
      subtitle: expand ? `${subtitle} · drop-down of strands` : subtitle
    })
  }
});
