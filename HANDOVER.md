# Running The Nile Explorer

This is the manual for the people who run the site. The first half needs no
technical knowledge. The second half is for whoever maintains the code.

---

## Part one — for the newsroom

### Where you work

Everything you publish is edited at **nilexplorer.net/studio**.

Sign in with the email address you were invited on. If you cannot get in, ask
whoever holds the Sanity account to re-invite you — there is no password to
reset on our side.

The menu down the left side is the whole site:

| | What lives there |
|---|---|
| **Newsroom** | Articles, Writers, Topics |
| **Podcast** | Episodes, and the show's own settings |
| **Documentaries** | The films |
| **Strands** | Culture, Media, Sport and the rest of the More menu |
| **The Festival** | Everything on the festival page |
| **About page** | The patron's page and the publication description |
| **Site settings** | The masthead, the menu, contact details, social links |

### Publishing an article

1. **Newsroom → Articles → the pencil-and-paper icon** at the top to start a new one.
2. Write the **headline**, then press **Generate** next to Web address.
3. Write the **standfirst** — one or two sentences under the headline. This is
   also what appears on cards and in Google results, so it is worth a minute.
4. Choose the **Byline**, set the **Publication date**, pick a **Section** and a
   **Topic**.
5. Add a **Lead image**. It will ask you to describe the picture — that
   description is read aloud to blind readers and shown if the image fails to
   load, which on a weak connection is often. Say what is in the frame.
6. Write the **Body**. Headings, bold, italic, links and numbered lists all
   work. Two things in the body are not text:
   - **Picture.** A photograph part-way down the piece. It asks for a
     description (read aloud to blind readers), and separately for a
     **caption**, which is what everyone else sees printed underneath. They are
     not the same sentence — the description says what is in the frame, the
     caption says what it means here. Either can be left out.
   - **Editor's note.** Set apart from the article in a box, in a different
     typeface, because it is the newsroom speaking rather than the author. Open
     it with "Editor's note:" and that label is emboldened for you.
7. Press **Publish**.

The site rebuilds itself and the article is live in about a minute.

**Saving is not publishing.** The Studio saves as you type, but nothing reaches
the site until you press Publish. That is what lets you leave something
half-written for a week.

### Adding a podcast episode

**Podcast → Episodes → new.** The two fields that matter most:

- **Episode number.** This is the episode's permanent name. It never changes.
- **YouTube video ID.** Only the ID, not the whole address. In
  `https://youtube.com/watch?v=p3lHlWR-O3g` the ID is `p3lHlWR-O3g`.

Set the stage to **Announced** for an episode that is booked but not out — it
appears under "Coming up" with no player.

**Withdrawing a video.** If an edit has to come down, untick **The video can be
watched** and say why. The Watch option disappears and the video address is
removed from the page completely, so nobody can find it by reading the page
source. The audio stays up.

### Changing the words on a page

The About page, the Festival page, the menu, the footer description, the
newsroom email address — all of it is in the Studio. Nothing that a reader sees
as words requires a developer.

### The orange PLACEHOLDER warnings

Some documents are marked **⚠ PLACEHOLDER**. These were written before there
was real material, to show what a section would look like when filled. They are
saved as drafts and **cannot be published** — the Publish button stays disabled.

To make one real: replace the invented text and pictures with the real thing,
then untick **Placeholder — not real content** at the bottom of the document.

What is currently marked:

| | Why |
|---|---|
| 2 podcast episodes | Not recorded. Their guest names were invented, so they now read "Guest to be confirmed" |
| 3 documentaries | Not commissioned, and the key art was computer-generated |
| The Festival | No dates, venues or programme are confirmed |

### When the site does not update

1. Wait two minutes. A rebuild is not instant.
2. Check you pressed **Publish**, not just left it saved.
3. Ask a developer to check the Vercel build log.

---

## Part two — for whoever maintains this

### What it is

A Next.js 16 site on Vercel, reading from Sanity at build time. Fully static.
There is no database, no server and no backend to keep alive.

```
Sanity ──(GROQ at build time)──► Next.js build ──► Vercel (static HTML)
   │                                                       ▲
   └── publish webhook ──► Vercel Deploy Hook ─────────────┘
```

### Accounts, and who owns them

Fill this in at handover and keep it current. **Every one of these must be
owned by the organisation, not by an individual.**

| Service | What for | Owner | Recovery contact |
|---|---|---|---|
| Vercel | Hosting | | |
| Sanity | Content | | |
| GitHub | Code | | |
| Domain registrar | nilexplorer.net | | |
| YouTube | Channel | | |
| Spotify for Podcasters | Podcast | | |
| Instagram | | | |
| Email provider | Newsletter | | |
| `newsroom@nilexplorer.net` | Public contact **and likely the recovery address for everything above** | | |

### Environment variables

In `.env.local` for development and in the Vercel project settings for
production. See `.env.example`.

| Variable | Secret? | Notes |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | No | Appears in every image URL |
| `NEXT_PUBLIC_SANITY_DATASET` | No | `production` |
| `SANITY_API_READ_TOKEN` | **Yes** | Viewer token. Draft preview only |
| `SANITY_DRAFT_SECRET` | **Yes** | Any random string. Guards the preview link |

With a `src/` directory, Next reads `.env` files from the **project root only**,
not from inside `src/`.

### Publishing pipeline

A Sanity webhook calls a Vercel Deploy Hook, which rebuilds the site.

**The webhook's GROQ filter is load-bearing.** Without it, every autosave
keystroke triggers a production build:

```groq
!(_id in path("drafts.**")) && _type in [
  "article","episode","film","author","topic","strand",
  "siteSettings","aboutPage","festival","podcastShow"
]
```

Set it at sanity.io/manage → API → Webhooks.

### Why a rebuild rather than instant revalidation

A full rebuild takes about a minute and has almost nothing in it that can
break: no API tokens in the running site, no route handler, no cache semantics
to reason about. For a newsroom publishing a few times a week that trade is
worth it.

If the minute ever becomes intolerable, the upgrade is a
`src/app/api/revalidate/route.ts` that the webhook calls instead. Two things
about this Next version that every tutorial online gets wrong:

- **`revalidateTag(tag)` with one argument is deprecated and errors in
  TypeScript.** Use `revalidateTag(tag, 'max')`, or
  `revalidateTag(tag, { expire: 0 })` for immediate expiry.
- **`updateTag()` and `refresh()` cannot be called from a Route Handler** —
  Server Actions only. A webhook must use `revalidateTag`.

### Why `cacheComponents` is off

Next 16 ships two caching models. The site uses the previous one. Turning on
`cacheComponents` is not a flag flip: it requires a `<Suspense>` audit of every
route, and it buys nothing for a site that is fully static. Leave it off unless
there is a specific reason.

### Images

`next.config.ts` sets a custom image loader
(`src/lib/sanity/loader.ts`) that resizes through Sanity's CDN instead of
Vercel's optimiser. Two reasons:

1. It keeps image delivery on Sanity's allowance rather than Vercel's meter.
2. **Replacing a photo actually replaces it.** Next's optimiser caches by URL
   with no way to invalidate, so swapping an image at the same address serves
   the old one for hours. Sanity's URLs contain a file hash, so a new picture
   is a new address.

Anything not on `cdn.sanity.io` passes through untouched.

### Draft preview

`/api/draft` sets the preview cookie; `/api/draft/disable` clears it. The
preview bar at the top of the page is the way out — it is a form button, not a
link, because Next prefetches links and would clear the cookie before anyone
clicked.

The route redirects to the slug it looks up in Sanity, never to one from the
query string. That is an open-redirect guard; do not "simplify" it.

### The one thing the free Sanity plan does not give you

**Backups.** Set up a recurring `sanity dataset export` — a GitHub Action on a
cron committing into the repo is enough, and free.

The free plan also has only two roles, Administrator and Viewer, which means
every editor is an administrator who could delete the dataset. Sanity's Growth
plan ($15/seat/month) adds Editor and Contributor roles and scheduled
publishing. That is the trigger to upgrade — not running out of capacity.

### Costs

| | Plan | Cost |
|---|---|---|
| Vercel | Pro | $20/month |
| Sanity | Free | $0 |
| Email provider | Free tier | $0 |
| Domain | | ~$15/year |

Editors need **no Vercel seat**; they work in Sanity. Only developer seats bill.

**Vercel Hobby is not an option here.** It is restricted to non-commercial
personal use, and Vercel's definition of commercial explicitly includes work
done by a paid consultant. Enforcement is account suspension.

### Verifying a change

```bash
npm run build          # all routes must prerender; none may go dynamic

node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-audit.js
node design/tools/cdp.js "http://localhost:3000/" 390  design/tools/probe-overflow.js
node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-focus.js 3
node design/tools/cdp.js "http://localhost:3000/podcasts" 1440 design/tools/probe-player.js
```

The baseline to hold: **0 contrast failures, 0 images without alt text, 0
unnamed controls, no horizontal overflow.**

One regression test that is easy to lose: set an episode's **video can be
watched** to off, then view source on `/podcasts` and search the page for the
YouTube video ID. It must not be there. `toPlayerEpisode` in
`src/lib/content.ts` exists for this and nothing else.

### Things to finish

- [ ] **8 archive images have no description.** They came from WordPress with
      empty alt attributes. They are live, and the Studio shows a validation
      error on each until someone writes one.
- [ ] **The festival carousel is empty.** The previous images were licensed
      stock photographs of other events; they were not carried over rather than
      re-hosted as if they were the festival's own.
- [ ] **The podcast has no RSS feed configured.** The Listen player uses the
      Spotify show embed, which plays the whole show rather than the episode
      being read about. Put the origin feed in Podcast settings and that fixes
      itself — and submitting the same address to Apple Podcasts is all a
      listing there takes.
- [ ] **No newsletter provider.** The section does not render until one is set
      in Site settings. It previously accepted addresses and threw them away.
- [ ] **Delete `scripts/ingest.mjs` and `content/`** once the site has been
      building from Sanity for long enough to trust it. They are the migration's
      source material, not live inputs.
- [ ] **WordPress redirects.** Add any old permalinks to `next.config.ts` at
      cutover. Slugs were preserved, so this is only needed where WordPress used
      a dated path.
- [ ] **Linting does not work.** `npm run lint` runs `next lint`, which Next 16
      removed — it now reads "lint" as a directory name and errors. ESLint is not
      installed either, and `.eslintrc.json` extends `next/core-web-vitals`,
      which needs `eslint-config-next`. Fixing it properly means installing
      `eslint` + `eslint-config-next` and migrating to flat config
      (`eslint.config.mjs`). This predates the CMS work and was left alone rather
      than folded into it. `npx tsc --noEmit --incremental false` is the check
      that does work.

### Cutover, when it happens

`nilexplorer.net` currently points at the WordPress site. Order matters:

1. Media fully migrated into Sanity and verified — every article image is
   hot-linked to `nilexplorer.net/wp-content/` today, so this must be done
   first or they all break.
2. Capture the WordPress permalink list, add redirects.
3. Deploy to a Vercel preview URL and check every route against the live site.
4. Point DNS at Vercel.
5. Keep WordPress on a subdomain for 30 days as a rollback, then decommission
   it and stop paying for it.

Check: `grep -r "nilexplorer.net/wp-content" .next/` must return nothing.
