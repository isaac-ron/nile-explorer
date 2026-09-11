import { defineType, defineField } from 'sanity';

/**
 * The About page.
 *
 * Every word of this page was hardcoded in about/page.tsx, including a visible
 * "Still needed: confirmation of the formal titles and honorifics" note that
 * nobody without a developer could clear. That note is a field here now, so
 * the person who has the answer can simply delete it.
 *
 * The patron's biography lives on the writer record, not here — it belongs to
 * the person, and the byline note at the foot of their articles comes from the
 * same place.
 */
export default defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  groups: [
    { name: 'patron', title: 'Patron', default: true },
    { name: 'subjects', title: 'Recurring subjects' },
    { name: 'publication', title: 'The publication' }
  ],
  fields: [
    defineField({
      name: 'patronKicker',
      title: 'Section label',
      type: 'string',
      group: 'patron',
      initialValue: 'The patron',
      description: 'The small line at the very top of the page.'
    }),
    defineField({
      name: 'patronRole',
      title: 'Role line',
      type: 'string',
      group: 'patron',
      description: 'Printed above the name — "Patron of The Nile Explorer".'
    }),
    defineField({
      name: 'editorialNote',
      title: 'Editorial note',
      type: 'text',
      rows: 2,
      group: 'patron',
      description:
        'A boxed note shown on the page, for saying plainly what is still unconfirmed. It is ' +
        'visible to readers. Clear this field to remove the box entirely.'
    }),
    defineField({
      name: 'themes',
      title: 'Recurring subjects',
      type: 'array',
      group: 'subjects',
      of: [{ type: 'namedDetail' }],
      description:
        'The cards under "Recurring subjects". These should describe what the published articles ' +
        'actually return to, rather than what the platform intends to cover.',
      validation: (rule) => rule.max(6).warning('More than six cards will crowd the row.')
    }),
    defineField({
      name: 'themesHeading',
      title: 'Heading for that section',
      type: 'string',
      group: 'subjects',
      initialValue: 'Recurring subjects'
    }),
    defineField({
      name: 'publicationHeading',
      title: 'Heading',
      type: 'string',
      group: 'publication',
      initialValue: 'About the publication'
    }),
    defineField({
      name: 'publicationBody',
      title: 'About the publication',
      type: 'blockContent',
      group: 'publication',
      description:
        'A couple of paragraphs on what the network is and what it publishes. This is the ' +
        'plainest statement of what the site is, so it is worth keeping current.'
    }),
    defineField({
      name: 'contactBlurb',
      title: 'Contact note',
      type: 'text',
      rows: 2,
      group: 'publication',
      description:
        'The line in the "Get in touch" box — "Pitches, corrections and rights of reply go to ' +
        'the newsroom directly."'
    }),
    defineField({
      name: 'correctionsNote',
      title: 'Corrections policy',
      type: 'string',
      group: 'publication',
      description:
        'The line under the contact details — "Corrections and rights of reply are published in ' +
        'full." This is a public commitment, so change it only deliberately.'
    })
  ],
  preview: {
    prepare: () => ({ title: 'About page' })
  }
});
