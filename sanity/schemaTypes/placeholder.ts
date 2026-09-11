import { defineField } from 'sanity';

/**
 * The placeholder guard.
 *
 * The site was built before there was much real material, so several sections
 * are filled with invented content: two unwritten articles, two unrecorded
 * podcast episodes, three uncommissioned films, a festival programme that has
 * not been scheduled. Those were imported so the client can see the intended
 * shape and edit rather than start from a blank document.
 *
 * Nothing invented may reach the live site. A document carrying this flag
 * fails validation, and Sanity disables Publish while a document has
 * validation errors — so clearing the flag is a deliberate act that says
 * "this is now real", not something anyone can do by accident.
 *
 * To publish: replace the invented content with the real thing, then untick
 * the box. See HANDOVER.md.
 */
export const placeholderField = defineField({
  name: 'placeholder',
  title: 'Placeholder — not real content',
  type: 'boolean',
  initialValue: false,
  description:
    'Ticked means this document is a stand-in written to show the layout, not real content. ' +
    'It cannot be published while this is ticked. Replace the invented text and images with ' +
    'the real thing, then untick this box.',
  validation: (rule) =>
    rule.custom((value) =>
      value === true
        ? 'This is placeholder content and cannot be published. Replace the invented text ' +
          'and images with the real thing, then untick "Placeholder — not real content".'
        : true
    )
});

/** Marks placeholder rows in document lists so they are obvious at a glance. */
export const placeholderSubtitle = (isPlaceholder: boolean | undefined, subtitle: string): string =>
  isPlaceholder ? `⚠ PLACEHOLDER — ${subtitle}` : subtitle;
