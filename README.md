# The Nile Explorer

Next.js front end for The Nile Explorer Media Network — articles, the podcast,
documentaries, the festival and an about page, built on the design system in
`DESIGN.md` and edited in Sanity.

**If you run the newsroom or maintain this site, read [HANDOVER.md](HANDOVER.md)
first.** This file is about the code.

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run dev                  # http://localhost:3000, Studio at /studio
npm run build
```

## Where the content comes from

Sanity. Every page is built from GROQ queries at build time and served as static
HTML; publishing in the Studio triggers a rebuild. There is no database, no
server and no runtime fetch for text — only images, which come from Sanity's CDN.

```
sanity/schemaTypes/     what an editor can fill in
sanity/structure.ts     how the Studio menu is arranged
src/lib/sanity/         client, GROQ, image helpers, next/image loader
src/lib/content.ts      the seam: the only file that knows Sanity exists
```

`src/lib/content.ts` is the boundary. Page components consume its exported types,
not the shape Sanity returns, so a change to a GROQ projection stops there.

### The Studio

Mounted at `/studio` in this same app — one repository, one deploy. Note that
`sanity.config.ts` must be imported only from a **client** component
(`src/app/studio/[[...tool]]/Studio.tsx`). Importing it from a Server Component
pulls the whole Studio into the RSC graph, where `swr` resolves to a build with
no default export and the build fails.

Four documents are singletons — Site settings, About page, The Festival, Podcast
settings. `sanity.config.ts` keeps them out of the global "create new" menu and
removes their delete action, because a second Site settings document is easy to
make, confusing, and produces no error.

## Migrating from WordPress

`npm run migrate -- --dry` rehearses; without `--dry` it writes. Deterministic
document ids, so re-running overwrites rather than duplicates.

It reads the WordPress REST API directly rather than `content/articles.json`.
Measured across all eleven pieces, the old regex parser came within 3 leaf blocks
and 73 characters of the original — so it was very nearly lossless. What it did
destroy is inline markup: 6 bold and 11 italic spans. There are no hyperlinks in
the archive, so none were lost, though none could have been expressed either.

It also **downloads every image and uploads it into Sanity**. Article images
currently hot-link to `nilexplorer.net/wp-content/`, and that domain is going to
point at this site instead. Skip that step and every article image 404s on
cutover.

Placeholder content is imported as drafts carrying `placeholder: true`, which the
schema treats as a validation error — visible and editable, unpublishable until
someone replaces it. The two invented episodes' four fictional guest names were
**not** carried across; the slots read "Guest to be confirmed".

`scripts/ingest.mjs` and `content/` are the migration's source material. Delete
both once the site has been building from Sanity long enough to trust it.

## Podcast: audio, video, and moving to RSS

One episode, two renderings. `PodcastPlayer` shows the artwork with a play button
and a Watch / Listen toggle; neither iframe mounts until the reader picks one, so
nothing autoloads.

**The Spotify embed is a stopgap.** The proper source of truth for a podcast is
its origin RSS feed — Spotify, Apple, YouTube Music and the rest all ingest that
same feed; they are mirrors, not sources. Put the feed address in Podcast
settings in the Studio and the player can drive per-episode audio from it instead
of embedding the whole show. Adding Apple Podcasts is then just submitting the
same address.

`videoAvailable: false` is a real boundary, not a display toggle. The player is a
client component, so anything passed to it is serialized into the RSC payload and
readable in page source. `toPlayerEpisode` narrows the episode to what the player
needs and nulls the URLs when a video is withdrawn. Do not pass an episode
straight through.

## Routes

| Route | Rendering |
|---|---|
| `/` | Static — lead, podcast band, latest, analysis river, documentaries, festival |
| `/articles` | Dynamic — takes `?topic=` and `?section=` |
| `/articles/[slug]` | Static, prerendered from `getArticleSlugs()` |
| `/podcasts` | Static — player with Watch/Listen |
| `/documentaries` | Static |
| `/festival` | Static |
| `/about` | Static |
| `/more`, `/more/[strand]` | Static |
| `/studio` | The Sanity Studio |
| `/api/draft`, `/api/draft/disable` | Draft preview in and out |

`/television` redirects to `/documentaries`.

## Design system

Plain CSS with custom properties, no utility framework. Four files imported by
`src/styles/globals.css`: `tokens.css`, `base.css`, `layout.css`,
`components.css`.

Brand identity is fixed: navy `#06183A`, gold `#C4881C`, Newsreader over
Schibsted Grotesk. Two constraints from the accessibility audit:

- `--gold` is **not** a text colour (2.92:1 on the surface band). Use
  `--gold-text` `#96690F`.
- `--rule` `#E6E3DC` is decorative only. Interactive borders use
  `--border-strong` `#8A8377`, which clears the 3:1 needed for component
  boundaries.

**Gold is rationed.** It marks section rules, the kicker underline, pull quotes,
the footer rule and the play button. Hovers, sidebar headings and ranked numbers
are navy or neutral. Adding gold elsewhere reverses a deliberate decision.

Platform icons in `public/icons` are brand marks and keep their own colours;
their frames stay neutral so the page does not pick up a second accent palette.

## Verifying

`design/tools/` holds a zero-dependency Chrome DevTools Protocol harness.

```bash
node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-audit.js    # contrast, targets, alt, headings
node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-focus.js 3  # focus ring after 3 Tabs
node design/tools/cdp.js "http://localhost:3000/" 390 design/tools/probe-overflow.js  # horizontal overflow
node design/tools/cdp.js "http://localhost:3000/podcasts" 1440 design/tools/probe-player.js
node design/tools/shot.js "http://localhost:3000/" 1440 out.png true                  # screenshot
```

The baseline to hold: **0 contrast failures, 0 images without alt text, 0 unnamed
controls exposed to the accessibility tree, no horizontal overflow.** Remaining
sub-24px targets are inline links inside sentences, which WCAG 2.2 exempts.

Screenshots must come from `shot.js`, not `chrome --screenshot`, which ignores
small `--window-size` values. A full-page capture does not always trigger lazy
images far below the fold — use `probe-all-img.js` to check loading, not a
screenshot.

Note `tsconfig.json` sets `incremental: true`. A stale `tsconfig.tsbuildinfo`
will make `tsc --noEmit` report success without checking anything; use
`npx tsc --noEmit --incremental false` when you need to trust the result.

## Known gaps

Tracked as a checklist in [HANDOVER.md](HANDOVER.md) — in short: 8 archive images
need descriptions, the festival carousel has no photography, the podcast has no
RSS feed, and no newsletter provider is configured (the section does not render
until one is).
