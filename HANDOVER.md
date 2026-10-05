# Running The Nile Explorer

This is the manual for the people who run the site. The first half needs no
technical knowledge. The second half is for whoever maintains the code.

---

## Part one — for the newsroom

### Where you work

Everything you publish is edited at **www.nileexplorer.com/studio**.

It opens on **Home**, which shows:

- **In progress** — everything saved but not yet published, newest first.
  "Never published" means it is not on the site at all; "Unpublished changes"
  means the site still shows the older version.
- **Most read** — what readers are opening and sharing this fortnight. This is
  what decides Top stories on the front page.
- **Recently published**, and **Commissioned** pieces not yet written.
- **Needs attention** — small fixes that affect readers, such as a picture
  with no description or a writer with no biography.

Click any row to open it. **New article** at the top starts one.

Sign in with the email address you were invited on. If you cannot get in, ask
whoever holds the Sanity account to re-invite you — there is no password to
reset on our side.

The menu down the left side is the whole site:

| | What lives there |
|---|---|
| **Newsroom** | Articles, Writers, Topics, and Readership — what is being read |
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
7. Press **Preview** (in the menu beside Publish) to see it on the site
   before anyone else can. A yellow bar across the top says you are
   previewing; **Leave preview** takes you back to the normal site.
8. Press **Publish** — or **Publish & view**, which publishes and then opens
   the live page in a new tab a few seconds later.

The article is live within seconds, and it goes straight into **Latest** on the
front page — the three newest pieces always sit there.

### What decides Top stories

The five stories across the top of the front page are chosen automatically, by
how much each piece is being **read and shared** on the site right now. A
share counts for five reads, and a day's reading counts for half as much three
days later, so the section follows what readers are interested in this week
rather than what was popular a month ago. **Newsroom → Readership** shows the
counts behind it, most read first.

On launch day nothing has been read yet, so Top stories start out as simply the
next-newest pieces after Latest, and sort themselves out as readers arrive.

If a story has to lead regardless — breaking news, say — open it, go to the
**Front page** tab and set **Pin to Top stories** to a number. Higher numbers
win and the highest becomes the lead. Clear it once the piece has had its run;
nothing else needs undoing.

### Writers

Every writer with a published piece has their own page, at
`/writers/their-name`, listing everything they have written. Bylines across the
site link to it, and **Writers** in the footer lists everyone.

The page is built from their record under **Newsroom → Writers**: **Portrait**,
**Role**, **Biography**, and the **Web address** (press Generate after typing
the name). A writer with no biography yet gets the one-line note from the foot
of their articles instead, so it is worth writing a few sentences for each.

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

**Nothing is marked at the moment.** The pieces that were, were unticked and
published on 23 September 2026, and the site presents them as what they are:

| | How the site shows it |
|---|---|
| Podcast episodes 2 and 3 | Under **Coming up**, with "Guest to be confirmed". Not recorded yet |
| 3 documentaries | "In production" or "In development". The key art was computer-generated |
| The Festival | "Dates to be announced", with an editorial note that nothing is confirmed |

Keep those labels true. An episode whose date has passed still shows under
**Coming up** with that date until someone changes it, so move the date, or
publish the episode, when it slips.

### When the site does not update

1. Refresh the page. A published change shows on the next load.
2. Check you pressed **Publish**, not just left it saved.
3. Wait fifteen minutes. Even if the instant update fails, every page refreshes
   itself on that schedule.
4. If it is still missing after that, ask a developer to check the webhook
   (Part two → Publishing pipeline).

---

## Part two — for whoever maintains this

### What it is

A Next.js 16 site on Vercel, reading from Sanity. Every page is static HTML,
regenerated in the background when content changes (ISR). There is no database
of our own and nothing to keep alive; the two route handlers are stateless.

```
Sanity ──(GROQ)──► Next.js Data Cache ──► static HTML on Vercel ──► readers
   │                      ▲                                            │
   └─ publish webhook ──► /api/revalidate (expires the cache)          │
   ▲                                                                   │
   └──────────── /api/track (read and share counts) ◄──────────────────┘
```

### Accounts, and who owns them

**Every one of these must be owned by the organisation, not by an
individual.** The identifiers are filled in; the owner and recovery contact
for each are for the organisation to complete at handover, and to keep
current after that. An account nobody at the organisation can sign in to is
an account the organisation does not have.

| Service | What for | Identifier | Owner | Recovery contact |
|---|---|---|---|---|
| Vercel | Hosting | Project serving www.nileexplorer.com | | |
| Sanity | Content | Project `bahk4a2x`, dataset `production` | | |
| GitHub | Code | `github.com/isaac-ron/nile-explorer` — **a personal account; transfer it** | | |
| GitHub | Backups | `nile-explorer-backups`, to be created in the organisation (see Backups) | | |
| healthchecks.io | Tells the newsroom when a backup is missed | To be created | | |
| Domain registrar | Domain | `nileexplorer.com` | | |
| Old domain | Old shared links (see "The domain") | `nilexplorer.net` | | |
| YouTube | Channel | | | |
| Spotify for Podcasters | Podcast | | | |
| Instagram | | | | |
| EmailOctopus | Newsletter: the subscriber list ("Audience") and sending | API key and list ID in Vercel env vars; see design/newsletter/README.md | | |
| Newsroom mailbox | Public contact **and likely the recovery address for everything above** | Site settings reads `newsroom@nilexplorer.com`, which cannot receive mail; see Things to finish. Use a mailbox on nileexplorer.com | | |

**The code is on the developer's personal GitHub account.** Before
handover, create a GitHub organisation for The Nile Explorer and transfer the
repository to it (repository Settings → Danger Zone → Transfer). Old links
redirect automatically. Then reconnect it in Vercel (Project → Settings →
Git). Secrets and variables do not travel with a transfer: add the backup
ones again (see Backups).

### Environment variables

In `.env.local` for development and in the Vercel project settings for
production. See `.env.example`.

| Variable | Secret? | Notes |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | No | Appears in every image URL |
| `NEXT_PUBLIC_SANITY_DATASET` | No | `production` |
| `SANITY_API_READ_TOKEN` | **Yes** | Viewer token. Draft preview only |
| `SANITY_REVALIDATE_SECRET` | **Yes** | Any random string. Must match the webhook's secret in Sanity |
| `SANITY_API_WRITE_TOKEN` | **Yes** | **Editor** token. Lets `/api/track` write readership counts |

With a `src/` directory, Next reads `.env` files from the **project root only**,
not from inside `src/`.

### Publishing pipeline

A Sanity webhook calls `/api/revalidate` on every publish. The route checks the
webhook's signature, then expires the `sanity` cache tag that every
published-content query carries, and each page regenerates on its next request.
An editor who publishes and then refreshes the page sees the change.

As a safety net, every cached query also expires on its own after 15 minutes
(`CONTENT_REVALIDATE` in `src/lib/sanity/client.ts`), so a missed or broken
webhook delays content rather than losing it. The front page regenerates every
10 minutes regardless, because that is how often the readership ranking is
re-read.

**Setting up the webhook** — sanity.io/manage → the project → API → Webhooks →
Create:

| Field | Value |
|---|---|
| URL | `https://www.nileexplorer.com/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | the GROQ below |
| HTTP method | POST |
| Secret | the same string as `SANITY_REVALIDATE_SECRET` in Vercel |

**The filter is load-bearing.** Without it every autosave keystroke flushes the
site's cache, and so would every read counted by `/api/track`:

```groq
!(_id in path("drafts.**")) && _type != "articleStats" && !(_type match "sanity.*")
```

It lists what to **ignore** rather than what to include, so a document type
added later reaches the site on publish without anyone remembering to come
back here. An allowlist fails quietly: the new type's pages wait up to fifteen
minutes and nothing reports an error. The three exclusions are drafts
(autosaves), `articleStats` (every counted read), and Sanity's own system
documents (a preview writes one each time an editor presses Preview).

If the webhook in Sanity still has the older filter, a list beginning
`_type in ["article","episode"`, replace it with the line above.

**If a webhook to a Vercel Deploy Hook exists from before, delete it.** It is
not harmful, but it rebuilds the whole site on every publish for no benefit
now.

To check the webhook works: publish any small change, then look at the
webhook's delivery log in Sanity. A 200 is success; 401 means the two secrets
do not match; 500 means `SANITY_REVALIDATE_SECRET` is missing from Vercel.

### Readership and Top stories

`/api/track` receives a beacon from the browser when someone has spent a few
seconds on an article, and when they click a share button. It adds one to a
per-article `articleStats` document (`stats-<article id>`): lifetime totals, and
a bucket per day for the last 30 days. `getFrontPage` in `src/lib/content.ts`
ranks on the last fortnight, with a share worth five reads and each day's
reading halving in weight every three days. The constants sit together at the
top of that section of the file.

Things worth knowing:

- **No personal data.** Nothing identifies a reader: no cookie, no id, no IP
  stored. A browser remembers locally that it already counted an article, so
  a reload within 12 hours does not count twice.
- **Only production counts.** Preview deployments and `npm run dev` use the
  same dataset, so `/api/track` does nothing unless `VERCEL_ENV` is
  `production` (or `TRACK_READERSHIP=1`, for testing — and those test counts
  land in the live ranking, so delete them afterwards).
- **Bots are ignored** by user agent, and one address is limited to 20 counts a
  minute. This is proportionate for a front-page ranking, not a defence against
  someone determined to game it.
- **Cost.** Each count is one Sanity mutation, against the free plan's monthly
  API request allowance; looking the article up is served from cache. If
  traffic ever makes that a problem, the counter is the one thing to move to a
  dedicated store (Upstash Redis from the Vercel Marketplace is the obvious
  one) — the ranking only needs `getStats` to return the same shape.
- **Missing token** (`SANITY_API_WRITE_TOKEN`): nothing is counted, nothing
  errors, and Top stories quietly fall back to recency. A revoked token logs
  `Readership count failed` in the Vercel function logs.

### The build must not reuse the last build's content

**This is the one that will silently republish stale content if it gets
undone.**

Next keeps fetch results in a Data Cache at `.next/cache/fetch-cache`, and
Vercel restores `.next/cache` on every deployment — its own CI caching guide
says this is automatic and requires no configuration. Left alone, a rebuild
triggered by a Sanity publish re-runs every query, gets the *previous* build's
answers back out of that cache, and ships them. The build log is clean, the
route count is right, and the thing that was just published is not on the site.

This is measured, not theoretical. An edit made in Sanity survived a full
`next build` completely unseen and appeared only once that directory was
deleted.

So `npm run build` runs `scripts/clear-fetch-cache.mjs` first. Two consequences
worth knowing:

- **Vercel's Build Command must be `npm run build`, not `next build`.** Running
  `next build` directly skips the script and the staleness returns. Check it at
  Project → Settings → Build & Development Settings.
- **Do not "fix" this with `cache: 'no-store'` on the Sanity client.** It does
  stop the staleness, and it also turns every route dynamic: the site drops
  from static HTML to server-rendered on demand, which means a Sanity request
  on every page view. That was tried and reverted. The route table is how you
  catch it.

Only the Data Cache is cleared. The Turbopack compilation cache beside it is
untouched and still makes builds fast.

### Revalidation in this Next version

Two things that every tutorial online gets wrong:

- **`revalidateTag(tag)` with one argument is deprecated and errors in
  TypeScript.** Use `revalidateTag(tag, 'max')`, or
  `revalidateTag(tag, { expire: 0 })` for immediate expiry. The webhook uses
  `{ expire: 0 }`: with `'max'` the first visitor after a publish is served
  the old page, and that visitor is nearly always the editor checking it.
- **`updateTag()` and `refresh()` cannot be called from a Route Handler** —
  Server Actions only. A webhook must use `revalidateTag`.

And one about this codebase: `content.ts` dedupes queries with React's
`cache()`, which lasts one render. It used to be a module-level `Map`, which is
only correct when everything runs once at build time — on a running server it
would serve the first answer forever. Do not bring it back.

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

The Studio's **Preview** button (`sanity/actions.tsx`) writes a one-hour
secret into the dataset under the editor's own login
(`@sanity/preview-url-secret`), and opens `/api/draft` with it. The route
checks the secret with the read token, sets the Draft Mode cookie and
redirects to the page. `/api/draft/disable` clears the cookie.

There is deliberately no shared preview password. The Studio is served
publicly at /studio, so any password compiled into it is readable by anyone.

While the cookie is set, `query()` in `src/lib/content.ts` reads drafts for
that browser only, skipping every cache; everyone else keeps getting the
cached published page. Pages do not need to do anything to support preview.
(Before this, the cookie was set and every page ignored it.)

The redirect target is released only once the secret checks out, and must be
a path on this site; `//elsewhere` is flattened to a local path. That is an
open-redirect guard; do not "simplify" it.

The preview bar at the top of the page is the way out — it is a form button,
not a link, because Next prefetches links and would clear the cookie before
anyone clicked.

### The Studio: Home, buttons and colours

- **Home** (`sanity/components/Dashboard.tsx`) is registered as the first tool
  in `sanity.config.ts`, which makes it the Studio's landing page. It only
  reads. Its "Most read" uses the same scoring as the front page
  (`src/lib/popularity.ts`).
- **Preview** and **Publish & view** are added to every document with a page
  on the site; `sanity/paths.ts` says which page. A new document type with its
  own page needs a line there. Publish & view wraps Sanity's own Publish
  action, so validation and permissions are unchanged.
- **Colours** (`sanity/theme.ts`) replace Sanity's blue with the site's navy
  using `buildTheme`. If a Sanity upgrade breaks it, delete the `theme` line
  in `sanity.config.ts`; nothing else depends on it.
- **CORS.** The Studio talks to Sanity from the browser, so every address it
  is opened from must be listed at sanity.io/manage → API → CORS origins, with
  credentials allowed: `https://www.nileexplorer.com`, and
  `http://localhost:3000` for development. Anything else stops at a "Connect
  this Studio" screen.

### The one thing the free Sanity plan does not give you

**Backups.** So there is one of our own. Every night at 02:30 Nairobi time,
`.github/workflows/sanity-backup.yml` exports the whole dataset (documents,
drafts and images) and commits it to a separate private repository,
`nile-explorer-backups`.

- **Every day is kept, with no expiry.** Each night that anything changed is a
  commit, so the dataset can be brought back as it stood on any day, not just
  the last one. Sanity's free plan keeps three days of edit history, so the
  gap between a mistake and a restorable copy is never more than a day.
- **It stays small.** Images are named by their content, so git stores each
  picture once however many nights it appears in. Expect it to grow by the
  size of new photographs, around 1 MB an article, not by a full copy a day.
- **It is separate from the site's code** so that cloning the site does not
  mean downloading every photograph ever published, and so that the backups
  survive anything that happens to the site's repository.

**Setting it up, once.** All four steps are needed; until they are done, the
job fails with a message naming whatever is missing.

1. Create a **private** repository named `nile-explorer-backups`, in the same
   organisation as the site's repository, and tick **Add a README file**. It
   must have at least one commit: the job cannot check out an empty
   repository.
2. On a computer with git, run `ssh-keygen -t ed25519 -f backup-key -N ""`.
   It makes two files. In the **backups** repository, Settings → Deploy keys →
   Add: paste the contents of `backup-key.pub` and tick **Allow write
   access**. In the **site** repository, Settings → Secrets and variables →
   Actions → Secrets: add `BACKUP_DEPLOY_KEY` with the contents of
   `backup-key`. Then delete both files. A deploy key opens one repository
   only and never expires, which is why it is used instead of a personal
   token: those expire within a year, and the backup would stop with them.
3. In sanity.io/manage → API → Tokens, create a **Viewer** token named
   "Backups" and add it to the site repository's secrets as
   `SANITY_BACKUP_TOKEN`. Viewer can read drafts and cannot change anything.
4. In the site repository's **Variables** tab, add `BACKUP_REPOSITORY` as
   `<organisation>/nile-explorer-backups`.

Then Actions → Back up Sanity → **Run workflow**, and check that a commit
appears in the backups repository.

**Knowing it still runs.** A backup that silently stops is the usual way these
fail, and GitHub only emails the person who last edited the workflow. So make
a free check at healthchecks.io that expects a ping daily with a few hours'
grace, send its alerts to the newsroom address, and add its ping URL as the
variable `HEALTHCHECK_URL`. The job pings it on success and on failure, so the
newsroom hears about a failed backup and also about one that never ran.

**Restoring.**

1. Clone the backups repository. To restore an earlier day, check out that
   day's commit (`git log` lists them by date).
2. Package it the way Sanity's importer expects:
   `tar -czf restore.tar.gz production`
3. Log in as an administrator (`npx sanity login`); the Viewer token cannot
   write. Then, from the site's repository:
   `npx sanity dataset import restore.tar.gz production --replace -p bahk4a2x`

`--replace` overwrites each document with the backup's copy, so edits made
since that day are lost. Where only part of the site needs bringing back,
import into a scratch dataset first
(`npx sanity dataset create restore-check -p bahk4a2x`), compare, and copy
across what is needed.

**Rehearse it once a year** into `restore-check`, then delete that dataset:
the free plan allows two. An untested backup is a hope, not a backup.

The free plan also has only two roles, Administrator and Viewer, which means
every editor is an administrator who could delete the dataset.

**When to move to Sanity's Growth plan** ($15 a seat a month; a seat is anyone
who signs in to the Studio):

- **More than one or two editors.** Growth adds Editor and Contributor roles,
  so not everyone can delete everything.
- **Before a traffic spike, such as the December 2026 elections.** Every
  counted read is a Sanity request, and so is every page regeneration. The
  free plan stops at 250,000 a month and cannot buy more. Growth has the same
  allowance but charges $1 per 25,000 beyond it, so a busy month becomes a
  small bill instead of a publishing outage.
- Growth also keeps 90 days of edit history instead of three.

Growth does **not** include backups; those are Enterprise only. Keep the
backup job whichever plan the project is on.

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
npm run build          # see the route table note below

node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-audit.js
node design/tools/cdp.js "http://localhost:3000/" 390  design/tools/probe-overflow.js
node design/tools/cdp.js "http://localhost:3000/" 1440 design/tools/probe-focus.js 3
node design/tools/cdp.js "http://localhost:3000/podcasts" 1440 design/tools/probe-player.js
```

The baseline to hold: **0 contrast failures, 0 images without alt text, 0
unnamed controls, no horizontal overflow.** Two known exceptions the probe
cannot tell apart: text laid over the lead story's photograph (it samples the
page, not the image), and the thumbnail beside each story row, which is
`aria-hidden` and out of the tab order because it duplicates the headline link.

**The route table.** Every content page must show `○` or `●` with a Revalidate
column (10m for `/`, 15m for the rest). Only these may be `ƒ` (dynamic):
`/articles` (it reads `?topic=`), and the four under `/api`. Anything else
turning `ƒ` means a page is now hitting Sanity on every request.

Two regression tests that are easy to lose.

**The withdrawn video.** Set an episode's **video can be watched** to off, then
view source on `/podcasts` and search the page for the YouTube video ID. It
must not be there. `toPlayerEpisode` in `src/lib/content.ts` exists for this
and nothing else.

**The webhook.** Publish a small change and reload the front page; it must show
at once. If it takes fifteen minutes, the webhook is not arriving — check its
delivery log in Sanity.

**The stale rebuild.** Change something in Sanity, then rebuild *without*
deleting `.next`, and confirm the change is in the output:

```bash
# after editing, say, the site description in the Studio
npm run build
grep -r "the words you just typed" .next/server/app/index.html
```

If that comes back empty, the build is republishing the previous build's
content and every publish since the break has been invisible. See "The build
must not reuse the last build's content" above.

### Search engines

`/sitemap.xml` lists every page a reader can open: the sections, each strand,
each writer, and each published article with when it was last edited. It
refreshes with the rest of the site on publish. `/robots.txt` points crawlers
at it and keeps them out of `/studio` and `/api`. Both take the address from
**Site settings → Site address**, so they follow a domain change.

Once the domain is live, submit `https://www.nileexplorer.com/sitemap.xml` in
Google Search Console (proving ownership by a DNS record at the registrar).
That is also where to see what Google has indexed and any pages it cannot read.

### Things to finish

- [ ] **Transfer the GitHub repository** to an organisation account and fill in
      the accounts table. See "Accounts, and who owns them".
- [ ] **Set up backups** (four steps, plus the healthchecks.io check) and run
      one by hand. See "The one thing the free Sanity plan does not give you".
- [ ] **Fix the newsroom address in Site settings.** It reads
      `newsroom@nilexplorer.com`, a domain with no mail server, so anything
      sent to it bounces. It is printed under every article as the address
      for corrections, and it is where the festival's Register interest button
      sends people. The Zoho mailbox on nileexplorer.com is the likely
      intended home.
- [ ] **Set Site settings → Site address to `https://www.nileexplorer.com`.**
      It reads the bare domain, which redirects to www, so every address in
      the sitemap and in share previews is a redirect.
- [ ] **Domain renewals.** nilexplorer.net expires on 16 August 2027 and
      nileexplorer.com on 9 September 2027. Turn on auto-renew with a card
      the organisation holds.
- [ ] **Submit the sitemap** to Google Search Console after the domain is live.
- [ ] **8 archive images have no description.** They came from WordPress with
      empty alt attributes. They are live, and the Studio shows a validation
      error on each until someone writes one.
- [ ] **The festival carousel uses Unsplash stock photographs**, at the
      client's request, until there are photographs of the festival itself.
      Each is credited "Unsplash" and its description says only what is in the
      frame, not that it is the festival. Replace them under The Festival →
      Carousel photographs.
- [ ] **The podcast has no RSS feed configured.** The Listen player uses the
      Spotify show embed, which plays the whole show rather than the episode
      being read about. Put the origin feed in Podcast settings and that fixes
      itself — and submitting the same address to Apple Podcasts is all a
      listing there takes.
- [ ] **Newsletter: add EMAIL_OCTOPUS_API_KEY and EMAIL_OCTOPUS_LIST_ID to
      Vercel.** Sign-up works locally; the section stays hidden on the live
      site until both are set. Then fill in the postal address and verify the
      sending domain in EmailOctopus, and set up the welcome automation (see
      design/newsletter/README.md).
- [ ] **Delete `scripts/ingest.mjs` and `content/`** once the site has been
      building from Sanity for long enough to trust it. They are the migration's
      source material, not live inputs.
- [ ] **WordPress redirects.** See "The domain" below.
- [ ] **Writer biographies.** Kirangacha Mwaniki and Ruth Wacuka have no
      portrait, role or biography yet; their pages fall back to a one-line
      note.
- [ ] **Linting does not work.** `npm run lint` runs `next lint`, which Next 16
      removed — it now reads "lint" as a directory name and errors. ESLint is not
      installed either, and `.eslintrc.json` extends `next/core-web-vitals`,
      which needs `eslint-config-next`. Fixing it properly means installing
      `eslint` + `eslint-config-next` and migrating to flat config
      (`eslint.config.mjs`). This predates the CMS work and was left alone rather
      than folded into it. `npx tsc --noEmit --incremental false` is the check
      that does work.

### The domain

The site is served at **www.nileexplorer.com** (the bare domain redirects
there). The old WordPress domain, nilexplorer.net, no longer answers on the
web. Its mail, if anyone still uses it, runs on the old WordPress host and
stops when that hosting lapses. Move anything that matters, above all any
account recovery address, to a mailbox on nileexplorer.com (Zoho) first.

**Old shared links.** Anything shared before the move points at
nilexplorer.net and will not resolve unless that domain is pointed at Vercel
and added to the project as a redirect to www.nileexplorer.com. Slugs were
preserved, so a domain-level redirect is enough — except where WordPress used
a dated path such as /2025/09/the-headline, which needs its own line in
`next.config.ts`.

Share buttons take the address from the page the reader is on, so they are
right on any domain without configuration.
