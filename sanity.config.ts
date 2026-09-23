import { defineConfig, type DocumentActionComponent } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { apiVersion, dataset, projectId } from './sanity/env';
import { schemaTypes, SINGLETONS, SYSTEM_TYPES } from './sanity/schemaTypes';
import { structure } from './sanity/structure';
import StudioLogo from './sanity/components/StudioLogo';
import Dashboard from './sanity/components/Dashboard';
import { PreviewAction, publishAndView } from './sanity/actions';
import { studioTheme } from './sanity/theme';
import { HomeIcon } from './sanity/icons';

const singletons = new Set<string>(SINGLETONS);
const systemTypes = new Set<string>(SYSTEM_TYPES);

/**
 * Every document's buttons: Sanity's own, with "Publish & view" added after
 * Publish and "Preview" after that. Both hide themselves on anything without a
 * page on the site (see sanity/paths.ts).
 */
function withSiteActions(prev: DocumentActionComponent[]): DocumentActionComponent[] {
  const publish = prev.find((a) => a.action === 'publish');
  if (!publish) return [...prev, PreviewAction];
  const at = prev.indexOf(publish) + 1;
  return [...prev.slice(0, at), publishAndView(publish), PreviewAction, ...prev.slice(at)];
}

/**
 * The Studio, served from /studio inside this same Next.js app.
 *
 * Keeping it in the app rather than at a separate sanity.studio address means
 * one repository, one deploy and one thing to keep working. Editors reach it
 * at www.nileexplorer.com/studio.
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
   * The logo, and the site's navy in place of Sanity's blue (sanity/theme.ts).
   * The navbar, the layout and the tool menu can also be swapped, through
   * `studio.components`, but every one of them is a component we would then
   * own through Studio upgrades, and Sanity moves these internals between
   * majors. Logo and colour carry the brand with the least to maintain.
   */
  theme: studioTheme,
  studio: {
    components: { logo: StudioLogo }
  },

  /**
   * Home comes first, so it is where the Studio opens: what is in progress,
   * what is being read, what needs fixing. See sanity/components/Dashboard.tsx.
   */
  tools: (prev) => [
    { name: 'home', title: 'Home', icon: HomeIcon, component: Dashboard },
    ...prev
  ],

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
      prev.filter((item) => !singletons.has(item.templateId) && !systemTypes.has(item.templateId)),

    /**
     * Readership counts get no buttons at all: they belong to the site, and
     * deleting one would silently drop an article out of Top stories. The
     * singletons cannot be deleted, duplicated or unpublished out from under
     * the site. Everything else gets Preview and Publish & view.
     */
    actions: (prev, { schemaType }) =>
      systemTypes.has(schemaType)
        ? []
        : withSiteActions(
            singletons.has(schemaType)
              ? prev.filter(
                  ({ action }) => action && !['delete', 'duplicate', 'unpublish'].includes(action)
                )
              : prev
          )
  }
});
