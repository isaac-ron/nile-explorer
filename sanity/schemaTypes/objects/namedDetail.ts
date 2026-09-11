import { defineType, defineField } from 'sanity';

/**
 * A heading with a paragraph under it.
 *
 * One shape, three uses: the "Recurring subjects" cards on the About page, the
 * Festival strands, and the Festival Awards block. They render differently but
 * the content is identical in structure, so they share a type rather than
 * having three near-identical ones cluttering the Studio.
 */
export default defineType({
  name: 'namedDetail',
  title: 'Heading and description',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Heading',
      type: 'string',
      description: 'A few words. Printed in bold above the description.',
      validation: (rule) => rule.required().error('This needs a heading.')
    }),
    defineField({
      name: 'detail',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'One or two sentences. Plain text — no formatting is shown here.',
      validation: (rule) => rule.required().error('This needs a description.')
    })
  ],
  preview: {
    select: { title: 'name', subtitle: 'detail' }
  }
});
