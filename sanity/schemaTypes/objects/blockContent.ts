import { defineType, defineArrayMember, defineField } from 'sanity';

/**
 * Article and biography body text.
 *
 * The styles offered here are exactly the ones the site renders — see the
 * Portable Text components in src/components/Prose.tsx. Nothing else is
 * offered, because anything else would be silently dropped at render.
 *
 * Two of these are not text: a picture and an editor's note. Both came in with
 * copy supplied straight to the newsroom, which the WordPress ingest had no
 * way to express — body pictures were dropped entirely, and a note ran on as a
 * closing paragraph in the author's voice.
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
    }),

    /**
     * A picture in the body.
     *
     * Nothing ingested from WordPress carries one; copy supplied straight to
     * the newsroom does, and the site had no way to express it. The frame takes
     * its ratio from the file's real dimensions and its own pixel width as a
     * ceiling, so nothing is cropped to a house aspect and a small supplied
     * file is never upscaled — see the renderer in src/components/Prose.tsx.
     */
    defineArrayMember({
      type: 'figure',
      name: 'figure',
      title: 'Picture'
    }),

    /**
     * An editor's note.
     *
     * Apparatus, not argument. It renders as a callout in the sans face rather
     * than as a closing paragraph, because the serif body is the author's voice
     * and this is the newsroom's.
     */
    defineArrayMember({
      type: 'object',
      name: 'editorsNote',
      title: "Editor's note",
      fields: [
        defineField({
          name: 'text',
          title: 'Note',
          type: 'text',
          rows: 4,
          description:
            'Set apart from the body on the page. Open with "Editor’s note:" and that label is ' +
            'emphasised for you; without it the note still renders, just unlabelled.',
          validation: (rule) => rule.required().error("An editor's note needs some text.")
        })
      ],
      preview: {
        select: { text: 'text' },
        prepare: ({ text }) => ({
          title: "Editor's note",
          subtitle: (text ?? '').replace(/\s+/g, ' ').slice(0, 80)
        })
      }
    })
  ]
});
