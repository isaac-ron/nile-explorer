'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

/**
 * The Studio, behind a client boundary.
 *
 * `sanity.config.ts` must not be imported from a Server Component. Doing so
 * pulls the whole Studio into the React Server Components graph, where `swr` —
 * a dependency of Sanity's scheduling UI — resolves to its `react-server`
 * build, which has no default export, and the build fails.
 *
 * The Studio is a browser application; it has no business in the server graph
 * at all. This file is the boundary that keeps it out.
 */
export default function Studio() {
  return <NextStudio config={config} />;
}
