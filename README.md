# The Nile Explorer

Next.js front end for The Nile Explorer Media Network — articles, the podcast, television and an
about page, built on the design system in `DESIGN.md`.

```bash
npm install
npm run ingest     # pull content from WordPress + YouTube
npm run dev        # http://localhost:3000
npm run build
```

## Where the content comes from

`npm run ingest` (`scripts/ingest.mjs`) writes normalised JSON into `content/`. Re-runnable; only
overwrites its own output.

| Source | Access | Produces |
|---|---|---|
| nilexplorer.net | WordPress REST API, public, no auth | `articles.json`, `categories.json` |
| YouTube channel `UCcfZzC9x7rKBpp2b96885cw` | Channel RSS, public, no API key | `podcast.json`, `television.json` |
| Spotify show `1viond2HBFAncP9IYGOSd3` | Public embed, no auth | audio player |
| Instagram | No open feed API | Not ingested — editor-pasted embeds |

Things the ingest handles rather than passes through:

- **Podcast vs television.** The channel carries more than the podcast: live-stream tests, a
  special, and two re-uploaded PLO Lumumba speeches. Only ids in `PODCAST_VIDEO_IDS` are treated as
  episodes; everything else becomes Television. This is an editorial call, not something derivable
  from the feed, so it is an explicit list. **Add the video id there when a new episode goes up.**
- **Numeric slugs.** Two posts carry a bare post id as their WordPress slug (`/?p=9`) and are
  re-slugified from the title.
- **Thumbnail resolution.** YouTube only generates `maxresdefault` for HD uploads; older videos
  404. Each video's best existing thumbnail is resolved once, at ingest.
- **Block parsing.** WordPress returns flat HTML, parsed into typed blocks so rendering never
  injects raw markup.

## Podcast: audio, video, and moving to RSS

One episode, two renderings. `PodcastPlayer` shows the artwork with a play button and a
Watch / Listen toggle; neither iframe mounts until the reader picks one, so nothing autoloads.
Watch uses the YouTube embed, Listen uses the Spotify show embed.

**The Spotify embed is a stopgap.** The proper source of truth for a podcast is its origin RSS
feed. Every directory — Spotify, Apple, YouTube Music, Pocket Casts, Overcast — ingests that same
feed; the platforms are mirrors, not sources. Driving the site from the feed instead of a Spotify
show id is what makes the provider swappable.

To switch over, set `AUDIO.rssFeed` in `scripts/ingest.mjs` and re-run the ingest. To find the URL:

- If the show is hosted on **Spotify for Podcasters**, it is in the dashboard under
  Settings → Availability (or "RSS distribution"). It usually looks like
  `https://anchor.fm/s/<hash>/podcast/rss`.
- If it is hosted elsewhere (Buzzsprout, Captivate, Libsyn, Transistor), the host's dashboard
  exposes it as "RSS feed" or "Distribution".

Once the feed is wired in, each `<item>` gives `title`, `pubDate`, `description`,
`<itunes:duration>`, `<itunes:episode>` and — the important one — `<enclosure url>`, the actual
audio file. That means:

- a native `<audio>` player styled like the rest of the site, instead of a third-party iframe
- correct per-episode audio rather than the whole-show embed
- adding Apple Podcasts or any other directory is just submitting the same feed; **no code change**

The show is not yet on Apple Podcasts — checked against the iTunes search API, no match — so the
Apple mark in `public/icons` is unused until it is listed.

## Routes

| Route | Rendering |
|---|---|
| `/` | Static — lead, latest, analysis river, podcast, television, festival |
| `/articles` | Dynamic — takes `?category=<slug>` |
| `/articles/[slug]` | Static, 11 prerendered |
| `/podcasts` | Static — player with Watch/Listen |
| `/television` | Static — programmes and live streams |
| `/about` | Static — patron, subjects, selected writing, contact |

## Design system

Plain CSS with custom properties, no utility framework. Four files imported by
`src/styles/globals.css`: `tokens.css`, `base.css`, `layout.css`, `components.css`.

Brand identity is fixed: navy `#06183A`, gold `#C4881C`, Spectral over Libre Franklin. Two
constraints from the accessibility audit:

- `--gold` is **not** a text colour (2.92:1 on the surface band). Use `--gold-text` `#96690F`.
- `--rule` `#E6E3DC` is decorative only. Interactive borders use `--border-strong` `#8A8377`,
  which clears the 3:1 needed for component boundaries.

**Gold is rationed.** It marks section rules, the kicker underline, pull quotes, the footer rule
and the play button. Hovers, sidebar headings and ranked numbers are navy or neutral. Adding gold
elsewhere reverses a deliberate decision.

Platform icons in `public/icons` are brand marks and keep their own colours; their frames stay
neutral so the page does not pick up a second accent palette.

## Verifying

`design/tools/` holds a zero-dependency Chrome DevTools Protocol harness (Node 22 globals only).

```bash
node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-audit.js    # contrast, targets, alt, headings
node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-focus.js 3  # focus ring after 3 Tabs
node design/tools/cdp.js "http://localhost:3000/" 390 design/tools/probe-overflow.js  # horizontal overflow
node design/tools/cdp.js "http://localhost:3000/podcasts" 1440 design/tools/probe-player.js
node design/tools/shot.js "http://localhost:3000/" 1440 out.png true                  # screenshot
```

Current state across all six routes: **0 contrast failures, 0 images without alt text, 0 unnamed
controls exposed to the accessibility tree, no horizontal overflow.** Remaining sub-24px targets
are inline links inside sentences, which WCAG 2.2 exempts.

Screenshots must come from `shot.js`, not `chrome --screenshot`, which ignores small
`--window-size` values. Note that a full-page capture does not always trigger lazy images far below
the fold — use `probe-all-img.js` to check loading, not a screenshot.

## Known placeholders

- **`content/festival.json` is invented.** Nothing about a Nile Festival appears on
  nilexplorer.net, in any article, or on the YouTube channel — the dates, venues and programme came
  from the original design comp. Replace with the real programme, or delete the file and remove the
  section. It should not ship as-is.
- **Patron biography.** The live About page is placeholder text, so there was nothing to import.
  The page carries only what the published articles support, plus a visible editorial note.
- **Newsletter.** Form is UI only; no provider or subscriber store.
- **CMS.** Payload 3 chosen, not yet wired.
