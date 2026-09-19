/**
 * Drop Next's Data Cache before a build.
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 * ---------------------------------------------------------------------------
 * The site is rebuilt whenever the newsroom publishes. Without this step, that
 * rebuild can republish the *previous* build's content.
 *
 * Next stores fetch results in a Data Cache at `.next/cache/fetch-cache`, and
 * Vercel restores `.next/cache` on every deployment — its own CI caching guide
 * says this is automatic and needs no configuration. So a build triggered by a
 * Sanity publish re-runs every GROQ query, gets the previous build's answers
 * back out of that cache, and ships them. The build log is clean, the route
 * count is right, and the thing that was just published is not on the site.
 *
 * Measured on this project: an edit made in Sanity survived a full `next
 * build` completely unseen, and appeared only once this directory was deleted.
 *
 * ---------------------------------------------------------------------------
 * Why not the more obvious fixes
 * ---------------------------------------------------------------------------
 * `cache: 'no-store'` on the Sanity client does stop the staleness, and it also
 * turns every route dynamic — the whole site drops from static HTML to
 * server-rendered on demand, which means a running server, a Sanity request on
 * every reader's page view, and the read token live in production. That is the
 * opposite of what this architecture is for. It was tried and reverted; check
 * the route table if you are tempted.
 *
 * Deleting all of `.next/cache` also works, but it takes the Turbopack
 * compilation cache with it and roughly triples build time for no benefit.
 * Only the Data Cache is the problem, so only the Data Cache goes.
 *
 * ---------------------------------------------------------------------------
 * Keep this wired up
 * ---------------------------------------------------------------------------
 * It runs from the `build` script in package.json. Vercel must therefore be
 * running `npm run build` and NOT `next build` directly, or this is silently
 * skipped and the staleness comes back. Check:
 *
 *   Vercel → Project → Settings → Build & Development Settings → Build Command
 *
 * The regression test is in HANDOVER.md under "Verifying a change": edit
 * something in Sanity, rebuild WITHOUT deleting .next, and confirm the edit is
 * in the output.
 */

import { rm } from 'node:fs/promises';
import { join } from 'node:path';

const target = join(process.cwd(), '.next', 'cache', 'fetch-cache');

await rm(target, { recursive: true, force: true });

console.log('Cleared Next data cache — this build will read Sanity fresh.');
