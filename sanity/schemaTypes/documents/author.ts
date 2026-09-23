import { defineType, defineField } from 'sanity';
import { UsersIcon } from '../../icons';

/**
 * A writer.
 *
 * The old ingest stamped the same name on every article as a hardcoded string,
 * so a second contributor was impossible without a code change. This is that
 * fix: add a writer here and they are available as a byline immediately.
 */
export default defineType({
  name: 'author',
  title: 'Writer',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description:
        'The name as it should appear in the byline, with any titles or honorifics — ' +
        '"Dr. Aldo Ajou Deng-Akuey".',
      validation: (rule) => rule.required().error('A writer needs a name.')
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description:
        'The last part of the address of their writer page, e.g. nileexplorer.com/writers/ruth-wacuka. ' +
        'Press Generate after writing the name. Changing it later breaks links to their page.',
      options: { source: 'name', maxLength: 80 },
      validation: (rule) => rule.required().error('Press Generate to create the web address.')
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description:
        'How they are described on the site, e.g. "Patron & contributing author" or ' +
        '"Correspondent, Nairobi".'
    }),
    defineField({
      name: 'isPatron',
      title: 'This is the patron',
      type: 'boolean',
      initialValue: false,
      description:
        'Tick for Dr. Aldo Ajou Deng-Akuey only. The About page uses this to gather his writing, ' +
        'so ticking it for anyone else puts their pieces on his page.'
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'figure',
      description:
        'A head-and-shoulders photograph for their writer page. Portrait orientation, roughly 4:5.'
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'blockContent',
      description:
        'Shown on their writer page, and on the About page for the patron. A few paragraphs; a ' +
        'Pull quote block sets a quotation apart. Without one, their page shows the note below.'
    }),
    defineField({
      name: 'colophon',
      title: 'Note at the foot of their articles',
      type: 'text',
      rows: 2,
      description:
        'One line printed under every article they write, e.g. "Dr. Aldo Ajou Deng-Akuey writes ' +
        'on peace, governance and regional geopolitics." Leave empty for none.'
    })
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'portrait' }
  }
});
