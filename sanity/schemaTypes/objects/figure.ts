import { defineType, defineField } from 'sanity';

/**
 * An image with its description.
 *
 * Alt text is required, deliberately. Every one of the eleven images imported
 * from WordPress arrived with an empty alt attribute, so the site had to
 * synthesise `Illustration for "{title}"` at render time and the caption below
 * the lede image never appeared at all. Requiring it here fixes that at source
 * rather than papering over it downstream.
 *
 * Width and height come from Sanity's asset metadata, so nothing needs to be
 * entered by hand and next/image can always reserve the right box.
 */
export default defineType({
  name: 'figure',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Image description',
      type: 'string',
      description:
        'Describe what is in the picture, for readers using a screen reader and for when the ' +
        'image fails to load. Say what is happening and who is in frame — "Delegates seated ' +
        'around a conference table in Juba", not "photo" or "image of article".',
      validation: (rule) =>
        rule
          .required()
          .min(10)
          .error('Every image needs a description. Say what is in the picture.')
    }),
    defineField({
      name: 'credit',
      title: 'Photographer credit',
      type: 'string',
      description: 'Optional. Printed beneath the image, e.g. "Photograph by Daniel Athian".'
    })
  ],
  preview: {
    select: { media: 'asset', title: 'alt', subtitle: 'credit' }
  }
});
