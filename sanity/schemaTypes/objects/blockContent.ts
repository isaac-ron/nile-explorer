import { defineType, defineArrayMember } from 'sanity';

/**
 * Article and biography body text.
 *
 * The styles offered here are exactly the ones the site renders — see the
 * Portable Text components in src/components/Prose.tsx. Nothing else is
 * offered, because anything else would be silently dropped at render.
 *
 * Links and bold/italic are new capabilities. The old WordPress ingest
 * flattened inline markup with a regex, so the archive's emphasis was lost
 * (it comes back with the migration). No article carried a hyperlink, so none
 * was lost — but nothing could have carried one either, which is the part
 * worth fixing.
 */
export default defineType({
  name: 'blockContent',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      // Paragraph, two heading levels and a pull quote. The article page
      // renders h2 and h3 only, so deeper levels are not offered.
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h2' },
        { title: 'Sub-heading', value: 'h3' },
        { title: 'Pull quote', value: 'blockquote' }
      ],
      lists: [
        { title: 'Bulleted list', value: 'bullet' },
        { title: 'Numbered list', value: 'number' }
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' }
        ],
        annotations: [
          {
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              {
                name: 'href',
                title: 'Address',
                type: 'url',
                description:
                  'A full web address, starting with https:// — or mailto: for an email link.',
                validation: (rule) =>
                  rule
                    .required()
                    .uri({ scheme: ['http', 'https', 'mailto'] })
                    .error('Enter a full address starting with https:// or mailto:')
              }
            ]
          }
        ]
      }
    })
  ]
});
