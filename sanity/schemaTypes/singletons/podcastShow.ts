import { defineType, defineField } from 'sanity';

/**
 * The podcast itself, as distinct from its episodes.
 *
 * On the RSS field: the proper source of truth for a podcast is its origin
 * feed. Spotify, Apple, YouTube Music and the rest all ingest that same feed —
 * they are mirrors, not sources. The site currently embeds the Spotify player
 * as a stopgap, which means it plays the whole show rather than the episode
 * the reader is looking at. Filling in the feed address is what makes that
 * right, and what makes the provider swappable.
 */
export default defineType({
  name: 'podcastShow',
  title: 'Podcast settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Show title',
      type: 'string',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'The short line under the title — "Let us talk before we fight."'
    }),
    defineField({
      name: 'blurb',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'A paragraph on what the podcast is, shown at the top of the podcast page.'
    }),
    defineField({
      name: 'spotifyShowId',
      title: 'Spotify show ID',
      type: 'string',
      description:
        'Just the ID. In https://open.spotify.com/show/1viond2HBFAncP9IYGOSd3 the ID is the part ' +
        'after /show/. Used for the Listen player until an RSS feed is added below.'
    }),
    defineField({
      name: 'rssFeed',
      title: 'RSS feed address',
      type: 'url',
      description:
        'The podcast\'s own feed, from wherever the show is hosted — in Spotify for Podcasters ' +
        'it is under Settings → Availability, and looks like https://anchor.fm/s/…/podcast/rss. ' +
        'Adding it here replaces the Spotify player with one that plays the right episode. ' +
        'Submitting the same address to Apple Podcasts is all that listing there takes.'
    }),
    defineField({
      name: 'appleUrl',
      title: 'Apple Podcasts address',
      type: 'url',
      description:
        'Fill in once the show is listed on Apple Podcasts. The Apple button stays hidden while ' +
        'this is empty, so the site never links somewhere the show is not.'
    })
  ],
  preview: {
    prepare: () => ({ title: 'Podcast settings' })
  }
});
