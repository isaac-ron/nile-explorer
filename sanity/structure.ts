import type { StructureResolver } from 'sanity/structure';
import {
  DocumentsIcon,
  MicrophoneIcon,
  VideoIcon,
  MasterDetailIcon,
  CalendarIcon,
  InfoOutlineIcon,
  CogIcon,
  ChartUpwardIcon
} from './icons';

/**
 * How the Studio's left-hand menu is arranged.
 *
 * Without this you get a flat alphabetical list of every document type, which
 * is a developer's view of the content rather than a newsroom's. This groups
 * them the way the site is actually organised, and — more importantly — makes
 * the four one-of-a-kind documents open straight into an editing form instead
 * of a list containing a single item and a confusing "+" button.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('The Nile Explorer')
    .items([
      S.listItem()
        .title('Newsroom')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Newsroom')
            .items([
              S.documentTypeListItem('article').title('Articles'),
              S.documentTypeListItem('author').title('Writers'),
              S.documentTypeListItem('topic').title('Topics'),
              S.divider(),
              // What decides Top stories on the front page. Read-only: the
              // site writes these as articles are read and shared.
              S.listItem()
                .title('Readership')
                .icon(ChartUpwardIcon)
                .id('readership')
                .child(
                  S.documentTypeList('articleStats')
                    .title('Readership — most read first')
                    .defaultOrdering([{ field: 'views', direction: 'desc' }])
                    .canHandleIntent(() => false)
                )
            ])
        ),

      S.divider(),

      S.listItem()
        .title('Podcast')
        .icon(MicrophoneIcon)
        .child(
          S.list()
            .title('Podcast')
            .items([
              S.documentTypeListItem('episode').title('Episodes'),
              S.listItem()
                .title('Podcast settings')
                .icon(CogIcon)
                .id('podcastShow')
                .child(
                  S.document().schemaType('podcastShow').documentId('podcastShow')
                )
            ])
        ),

      S.listItem()
        .title('Documentaries')
        .icon(VideoIcon)
        .child(S.documentTypeList('film').title('Documentaries')),

      S.listItem().title('Strands').icon(MasterDetailIcon).child(S.documentTypeList('strand').title('Strands')),

      S.divider(),

      S.listItem()
        .title('The Festival')
        .icon(CalendarIcon)
        .id('festival')
        .child(S.document().schemaType('festival').documentId('festival')),

      S.listItem()
        .title('About page')
        .icon(InfoOutlineIcon)
        .id('aboutPage')
        .child(S.document().schemaType('aboutPage').documentId('aboutPage')),

      S.divider(),

      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings'))
    ]);
