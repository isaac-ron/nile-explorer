import { defineType, defineField } from 'sanity';
import { placeholderField } from '../placeholder';

/**
 * The Nile Festival.
 *
 * Everything on this page describes an event that has not happened yet. The
 * dates, venues and programme came from a design comp, and the five carousel
 * photographs were licensed stock of other events entirely.
 *
 * The page is built to say so. `datesAnnounced` off means the programme block
 * prints "dates to be confirmed" rather than inventing a date, and the
 * editorial note is shown to readers. Leave both as they are until the first
 * edition is actually scheduled.
 */
export default defineType({
  name: 'festival',
  title: 'The Festival',
  type: 'document',
  groups: [
    { name: 'overview', title: 'Overview', default: true },
    { name: 'programme', title: 'Programme' },
    { name: 'images', title: 'Photographs' }
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'standfirst',
      title: 'One-line description',
      type: 'string',
      group: 'overview',
      description: 'The line under the name — "An annual celebration of South Sudanese culture".',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'blurb',
      title: 'Introduction',
      type: 'text',
      rows: 4,
      group: 'overview',
      description: 'A paragraph on what the festival is and what it is for.',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'foundationBody',
      title: 'The foundation',
      type: 'blockContent',
      group: 'overview',
      description:
        'The section on the charity arm — the scholarships, the awards and the academy. Only ' +
        'state what has actually been established.'
    }),
    defineField({
      name: 'editorialNote',
      title: 'Editorial note',
      type: 'text',
      rows: 3,
      group: 'overview',
      description:
        'A boxed note shown to readers, saying what on this page is not yet confirmed. Keep it ' +
        'until the programme is real. Clearing this field removes the box.'
    }),
    defineField({
      name: 'datesAnnounced',
      title: 'The dates are confirmed',
      type: 'boolean',
      group: 'programme',
      initialValue: false,
      description:
        'Leave off until the dates are genuinely settled. While it is off, the page says the ' +
        'dates are to be confirmed instead of printing one.'
    }),
    defineField({
      name: 'dates',
      title: 'Dates',
      type: 'string',
      group: 'programme',
      hidden: ({ parent }) => !parent?.datesAnnounced,
      description: 'As they should read — "14–18 December 2026".',
      validation: (rule) =>
        rule.custom((value, context) => {
          const announced = (context.document as { datesAnnounced?: boolean } | undefined)
            ?.datesAnnounced;
          return announced && !value ? 'Enter the dates, or untick "The dates are confirmed".' : true;
        })
    }),
    defineField({
      name: 'strands',
      title: 'Strands',
      type: 'array',
      group: 'programme',
      of: [{ type: 'namedDetail' }],
      description: 'The parts of the festival — Culture, Sport, Fashion, Food, Entertainment.'
    }),
    defineField({
      name: 'awards',
      title: 'The Awards',
      type: 'namedDetail',
      group: 'programme',
      description: 'The awards block at the foot of the programme section.'
    }),
    defineField({
      name: 'slides',
      title: 'Carousel photographs',
      type: 'array',
      group: 'images',
      of: [{ type: 'figure' }],
      description:
        'The images across the top of the page. These must be photographs of the festival, or ' +
        'of the culture it celebrates — and the description on each must say what is actually ' +
        'in the frame, without claiming it is the festival if it is not.'
    }),
    placeholderField
  ],
  preview: {
    prepare: () => ({ title: 'The Festival' })
  }
});
