# The Nile Explorer

Next.js front end for The Nile Explorer Media Network — articles, podcast episodes and an about
page, built on the audited design system in `DESIGN.md`.

```bash
npm install
npm run ingest     # pull content from WordPress + YouTube
npm run dev        # http://localhost:3000
npm run build
```

## Where the content comes from

`npm run ingest` (`scripts/ingest.mjs`) writes normalised JSON into `content/`. It is re-runnable
and only overwrites its own output.

| Source | Access | Produces |
|---|---|---|
| nilexplorer.net | WordPress REST API, public, no auth | `articles.json`, `categories.json` |
| YouTube channel `UCcfZzC9x7rKBpp2b96885cw` | Channel RSS, public, no API key | `episodes.json` |
| Instagram | No open feed API | Not ingested — editor-pasted embeds by agreement |

The ingest handles three things worth knowing about:

- **Numeric slugs.** Two posts carry a bare post id as their WordPress slug (`/?p=9`). Those are
  re-slugified from the title so URLs are readable.
- **Thumbnail resolution.** YouTube only generates `maxresdefault` for HD uploads; older videos
  404. Each video's best existing thumbnail is resolved once, at ingest, rather than guessed.
- **Block parsing.** WordPress returns a flat run of HTML. It is parsed into typed blocks
  (`para` / `heading` / `quote` / `list`) so rendering never injects raw markup.

`src/lib/content.ts` is the only module that reads those files. When the CMS lands, that file
changes and the pages do not.

## Routes

| Route | Rendering |
|---|---|
| `/` | Static — lead story, latest grid, analysis river, podcast strip |
| `/articles` | Dynamic — takes `?category=<slug>` |
| `/articles/[slug]` | Static, 11 prerendered |
| `/podcasts` | Static — latest episode embedded, back catalogue |
| `/about` | Static — patron, recurring subjects, selected writing, contact |

## Design system

Plain CSS with custom properties, no utility framework. Four files, imported by
`src/styles/globals.css`:

```
tokens.css       brand colours, spacing scale, type scale
base.css         reset, typography, focus, skip link
layout.css       edition bar, masthead, ticker, footer
components.css   cards, story rows, hero, prose, rails, about
```

Brand identity is fixed and must not be restyled: navy `#06183A`, gold `#C4881C`, Spectral over
Libre Franklin. Two constraints carried over from the accessibility audit:

- `--gold` is **not** a text colour (2.92:1 on the surface band). Use `--gold-text` `#96690F`.
- `--rule` `#E6E3DC` is decorative only. Interactive borders use `--border-strong` `#8A8377`,
  which clears the 3:1 required for component boundaries.

Spacing was deliberately tightened from the first design pass after client feedback that the page
read too sparse. The `--space-*` scale and `--section-y` in `tokens.css` are where that lives.

## Verifying

`design/tools/` holds a zero-dependency Chrome DevTools Protocol harness (Node 22 globals only).
Run against a dev or production server:

```bash
node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-audit.js    # contrast, targets, alt, headings
node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-focus.js 3  # focus ring after 3 Tabs
node design/tools/cdp.js "http://localhost:3000/" 390 design/tools/probe-overflow.js  # horizontal overflow
node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-lazy.js     # every image actually loads
node design/tools/shot.js "http://localhost:3000/" 1440 out.png true                  # screenshot
```

Current state across all five routes: **0 contrast failures, 0 images without alt text, 0 unnamed
controls exposed to the accessibility tree, no horizontal overflow.** The only sub-24px targets
are inline links inside sentences, which WCAG 2.2 exempts.

Screenshots must come from `shot.js`, not `chrome --screenshot`: the latter ignores small
`--window-size` values and renders wider than asked, which looks like a layout bug that is not
there. Note also that `captureBeyondViewport` does not always trigger lazy images far below the
fold — use `probe-lazy.js` to check loading, not a screenshot.

## Not built yet

- **CMS.** Payload 3 was chosen (in-repo, Postgres, drafts and role-based access). Deferred.
- **Newsletter.** The form is UI only; no provider or subscriber store is wired.
- **Instagram embeds.** Agreed approach is editor-pasted post URLs, which needs the CMS first.
- **Patron biography.** The live site's About page is placeholder text, so there was nothing to
  import. The page carries only what the published articles support, plus a visible editorial note.
  Real biography, titles and a portrait are needed.

## Design phase

`design/reference/` holds the audited standalone pages this UI was ported from, and `design/build.js`
rebuilds the original Claude Design bundles. Both are kept for reference; neither is part of the
Next.js build. The multi-megabyte bundles themselves are gitignored and regenerable.
