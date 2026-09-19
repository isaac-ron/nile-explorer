import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { apiVersion, dataset, projectId } from './sanity/env';
import { schemaTypes, SINGLETONS } from './sanity/schemaTypes';
import { structure } from './sanity/structure';
import StudioLogo from './sanity/components/StudioLogo';

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

  /**
   * Studio branding.
   *
   * Only the logo is replaced. The navbar, the layout and the tool menu can
   * all be swapped the same way — see `studio.components` in the Sanity docs —
   * but every one of them is a component we would then own through Studio
   * upgrades, and Sanity moves these internals between majors. The logo is the
   * piece with the most brand value and the least surface area.
   *
   * Theming is available too, and was left alone on purpose: `buildLegacyTheme`
   * is deprecated in this version, and the current token API wants a full
   * palette across both colour schemes rather than a couple of brand colours.
   * Worth doing deliberately with Sanity's theme generator, not by hand.
   */
  studio: {
    components: { logo: StudioLogo }
  },

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
