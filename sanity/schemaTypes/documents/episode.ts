import { defineType, defineField } from 'sanity';
import { placeholderField, placeholderSubtitle } from '../placeholder';

/**
 * A podcast episode.
 *
 * Two things here used to require a developer and no longer do.
 *
 * The episode number was worked out by counting position in the YouTube feed,
 * which caps at fifteen uploads — so the day a sixteenth video went up, every
 * episode would have silently renumbered itself. It is a plain field now,
 * because "Episode 1" is a published identity, not an array index.
 *
 * Whether a video counted as a podcast episode at all was a hardcoded list of
 * YouTube ids in the ingest script; adding an episode meant editing code and
 * deploying. Now an episode is an episode because someone made one here.
 */
export default defineType({
  name: 'episode',
  title: 'Episode',
  type: 'document',
  groups: [
    { name: 'content', title: 'Episode', default: true },
    { name: 'video', title: 'Video' },
    { name: 'stills', title: 'Photographs' }
  ],
  fields: [
    defineField({
      name: 'state',
      title: 'Stage',
      type: 'string',
      group: 'content',
      initialValue: 'published',
      description:
        'Choose "Announced" for an episode that has been recorded or booked but not released. ' +
        'It appears under "Coming up" on the podcast page with no player.',
      options: {
        list: [
          { title: 'Released', value: 'published' },
          { title: 'Announced — not released yet', value: 'upcoming' }
        ],
        layout: 'radio'
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'number',
      title: 'Episode number',
      type: 'number',
      group: 'content',
      description:
        'Which episode this is — 1, 2, 3. Printed above the title. This is the episode\'s ' +
        'permanent identity, so it never changes once released.',
      validation: (rule) =>
        rule.required().integer().min(1).error('Give the episode its number.')
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      description:
        'The episode title, without "Episode 1" on the end — the number is printed separately ' +
        'just above it, so including it here reads as a mistake.',
      validation: (rule) => rule.required().error('An episode needs a title.')
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'content',
      description: 'Press Generate after entering the title.',
      options: { source: 'title', maxLength: 80 },
      validation: (rule) => rule.required().error('Press Generate to create the web address.')
    }),
    defineField({
      name: 'publishedAt',
      title: 'Release date',
      type: 'datetime',
      group: 'content',
      description:
        'When the episode went out, or is due out. Episodes are listed newest first by this date.',
      validation: (rule) => rule.required().error('Set a release date.')
    }),
    defineField({
      name: 'blurb',
      title: 'Description',
      type: 'text',
      rows: 4,
      group: 'content',
      description:
        'A short paragraph on what the conversation covers. Shown on the front page band, on the ' +
        'podcast page, and when the episode is shared.',
      validation: (rule) => rule.required().min(40).error('Write a short description.')
    }),
    defineField({
      name: 'guests',
      title: 'Guests',
      type: 'array',
      group: 'content',
      of: [{ type: 'guest' }],
      description: 'Who appeared, in the order they should be listed.'
    }),
    defineField({
      name: 'topics',
      title: 'Subjects discussed',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'A few short tags — "Constitutional review", "2026 elections". Type one and press ' +
        'Enter. These are just labels on the podcast page; they are separate from article topics.'
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube video ID',
      type: 'string',
      group: 'video',
      description:
        'Just the ID, not the whole address. In https://youtube.com/watch?v=p3lHlWR-O3g the ID ' +
        'is p3lHlWR-O3g. Leave empty for an episode that has no video.',
      validation: (rule) =>
        rule
          .regex(/^[A-Za-z0-9_-]{11}$/, { name: 'YouTube ID' })
          .error('A YouTube ID is 11 characters, e.g. p3lHlWR-O3g. Paste the ID, not the URL.')
    }),
    defineField({
      name: 'videoAvailable',
      title: 'The video can be watched',
      type: 'boolean',
      group: 'video',
      initialValue: true,
      description:
        'Untick to withdraw the video while an edit is reworked. The Watch option disappears and ' +
        'the video address is removed from the page entirely, so nobody can reach it by reading ' +
        'the page source. The audio stays available.'
    }),
    defineField({
      name: 'videoNote',
      title: 'Why the video is unavailable',
      type: 'string',
      group: 'video',
      hidden: ({ parent }) => parent?.videoAvailable !== false,
      description:
        'Shown to readers in place of the Watch option, e.g. "The video is being re-edited and ' +
        'will return shortly."'
    }),
    defineField({
      name: 'stills',
      title: 'Photographs from the recording',
      type: 'array',
      group: 'stills',
      of: [{ type: 'figure' }],
      description:
        'Pictures from the session. The first one is used as the episode artwork on the front ' +
        'page in place of the YouTube thumbnail, so put the strongest image first.'
    }),
    defineField({
      name: 'photographer',
      title: 'Photographer',
      type: 'string',
      group: 'stills',
      description:
        'Credited wherever a photograph from this episode appears. Set it once here rather than ' +
        'on each picture.'
    }),
    placeholderField
  ],
  orderings: [
    { title: 'Newest first', name: 'numberDesc', by: [{ field: 'number', direction: 'desc' }] }
  ],
  preview: {
    select: {
      title: 'title',
      number: 'number',
      state: 'state',
      media: 'stills.0',
      placeholder: 'placeholder',
      videoAvailable: 'videoAvailable'
    },
    prepare: ({ title, number, state, media, placeholder, videoAvailable }) => {
      const bits = [state === 'upcoming' ? 'Announced' : 'Released'];
      if (videoAvailable === false) bits.push('video withdrawn');
      return {
        title: `${number ? `Episode ${number} — ` : ''}${title}`,
        subtitle: placeholderSubtitle(placeholder, bits.join(' · ')),
        media
      };
    }
  }
});
