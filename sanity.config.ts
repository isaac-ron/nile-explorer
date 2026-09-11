import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { apiVersion, dataset, projectId } from './sanity/env';
import { schemaTypes, SINGLETONS } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

const singletons = new Set<string>(SINGLETONS);

/**
 * The Studio, served from /studio inside this same Next.js app.
 *
 * Keeping it in the app rather than at a separate sanity.studio address means
 * one repository, one deploy and one thing to keep working. Editors reach it
 * at nilexplorer.net/studio.
 */
export default defineConfig({
  name: 'nile-explorer',
  title: 'The Nile Explorer',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    // A GROQ console for whoever maintains this next. Harmless to editors —
    // it appears as a second tab they have no reason to open.
    visionTool({ defaultApiVersion: apiVersion })
  ],
  document: {
    /**
     * The four one-of-a-kind documents are reachable from the menu and nowhere
     * else. Without this they appear in the global "create new" list, and a
     * second Site settings document is both easy to make and very confusing:
     * the site reads one of them and no error is ever shown.
     */
    newDocumentOptions: (prev) =>
      prev.filter((item) => !singletons.has(item.templateId)),

    /** And they cannot be deleted, duplicated or unpublished out from under the site. */
    actions: (prev, { schemaType }) =>
      singletons.has(schemaType)
        ? prev.filter(
            ({ action }) => action && !['delete', 'duplicate', 'unpublish'].includes(action)
          )
        : prev
  }
});
