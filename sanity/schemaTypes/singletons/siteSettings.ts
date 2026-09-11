import { defineType, defineField } from 'sanity';

/**
 * The masthead, the menu, the footer and the site's own description.
 *
 * All of this used to be a `SITE` constant and a `NAV` array in the code, so
 * changing the contact address or adding a menu item meant a developer, a
 * commit and a deploy.
 *
 * There is one of these documents and there should only ever be one; the
 * Studio shows it as a single page rather than a list.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'nav', title: 'Menu' },
    { name: 'contact', title: 'Contact & social' }
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Publication name',
      type: 'string',
      group: 'identity',
      description: 'Used in the browser tab, in search results and in the footer.',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'tagline',
      title: 'Masthead line',
      type: 'string',
      group: 'identity',
      description: 'The line under the name — "The Mirror of Africa".',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'description',
      title: 'What the site is',
      type: 'text',
      rows: 3,
      group: 'identity',
      description:
        'One sentence. This is what appears under the name in Google results and when a link ' +
        'to the front page is shared, and it is printed in the footer. Aim for 20–30 words.',
      validation: (rule) => rule.required().min(60).max(300)
    }),
    defineField({
      name: 'url',
      title: 'Site address',
      type: 'url',
      group: 'identity',
      description:
        'The full address of the live site, e.g. https://nilexplorer.net — no slash at the end. ' +
        'Used to build share links and the sitemap, so an error here breaks sharing.',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'patron',
      title: 'Patron',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'identity',
      description: 'Whose writing the About page gathers.'
    }),
    defineField({
      name: 'nav',
      title: 'Top menu',
      type: 'array',
      group: 'nav',
      of: [{ type: 'navItem' }],
      description:
        'The menu across the top, in order. Drag to reorder. Keep it to six or so — the menu ' +
        'has to fit on a phone.',
      validation: (rule) => rule.required().min(1)
    }),
    defineField({
      name: 'pullQuote',
      title: 'Front page quotation',
      type: 'object',
      group: 'identity',
      description:
        'The quotation set apart in the column beside Analysis & opinion. Leave the text empty ' +
        'to remove the block entirely.',
      fields: [
        {
          name: 'text',
          title: 'Quotation',
          type: 'text',
          rows: 3,
          description: 'Without quotation marks — the page adds them.'
        },
        {
          name: 'attribution',
          title: 'Who said it',
          type: 'string',
          description: 'Name and role, e.g. "Dr. Aldo Ajou Deng-Akuey · Patron".'
        }
      ]
    }),
    defineField({
      name: 'email',
      title: 'Newsroom email',
      type: 'string',
      group: 'contact',
      description:
        'The public contact address. Printed on the About page and linked from the footer.',
      validation: (rule) =>
        rule.required().email().error('Enter a valid email address.')
    }),
    defineField({
      name: 'youtube',
      title: 'YouTube channel',
      type: 'url',
      group: 'contact',
      description: 'Full address of the channel page.'
    }),
    defineField({
      name: 'youtubeHandle',
      title: 'YouTube handle',
      type: 'string',
      group: 'contact',
      description: 'As displayed, including the @ — e.g. @thenilexplorerpodcast.'
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram profile',
      type: 'url',
      group: 'contact'
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram handle',
      type: 'string',
      group: 'contact',
      description: 'As displayed, including the @ — e.g. @thenilexplorer_podcast.'
    }),
    defineField({
      name: 'newsletterAction',
      title: 'Newsletter sign-up address',
      type: 'url',
      group: 'contact',
      description:
        'The form address from your email provider — in EmailOctopus it is the "form action" on ' +
        'the embedded form, and looks like https://eocampaign1.com/form/…. While this is empty ' +
        'the newsletter section does not appear on the site at all, which is deliberate: a form ' +
        'that goes nowhere collects addresses it then throws away.'
    })
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' })
  }
});
