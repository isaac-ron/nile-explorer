/**
 * Sanity connection settings.
 *
 * Project id and dataset are public: they appear in the browser bundle and in
 * every image URL, and a public dataset is readable by anyone regardless. The
 * read token is not, and is only ever imported from server code.
 *
 * With a `src/` directory, Next loads .env files from the project root only.
 * Put these in `.env.local` next to package.json, not inside src/.
 */

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Copy .env.example to .env.local and fill it in.'
);

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing NEXT_PUBLIC_SANITY_DATASET. Copy .env.example to .env.local and fill it in.'
);

/**
 * Pinned, not floating. A dated version means a Sanity API change can never
 * alter what this build returns; bumping it is a deliberate act.
 */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-02-19';

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}
