import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'guest',
  title: 'Guest',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description:
        'The guest\'s name as they would want it printed. Only name someone who actually ' +
        'appeared — if the booking is not confirmed, write "Guest to be confirmed".',
      validation: (rule) => rule.required().error('A guest needs a name.')
    }),
    defineField({
      name: 'role',
      title: 'Role or title',
      type: 'string',
      description:
        'How they are introduced, e.g. "Constitutional lawyer" or "Member, Council of States". ' +
        'Printed under the name.',
      validation: (rule) => rule.required().error('Say who the guest is.')
    })
  ],
  preview: {
    select: { title: 'name', subtitle: 'role' }
  }
});
