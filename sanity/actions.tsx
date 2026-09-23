import { useEffect, useRef, useState } from 'react';
import {
  useClient,
  useCurrentUser,
  type DocumentActionComponent,
  type DocumentActionProps,
  type SanityClient
} from 'sanity';
import { useToast } from '@sanity/ui/toast';
import { createPreviewSecret } from '@sanity/preview-url-secret/create-secret';
import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewSecret
} from '@sanity/preview-url-secret/constants';
import { EyeOpenIcon, LaunchIcon } from './icons';
import { apiVersion } from './env';
import { pathFor } from './paths';

/**
 * The Studio's two "see it on the site" buttons.
 *
 * Both open a new tab straight away, while the click still counts as the
 * editor's own action, and fill it in once the address is ready. A tab opened
 * after an `await` is treated by browsers as a pop-up and silently blocked.
 */

/** The document as it stands in the editor: the draft if there is one. */
const current = (props: DocumentActionProps) => props.draft ?? props.published;

/** A blank tab that says what it is waiting for, rather than sitting white. */
function openHoldingTab(message: string): Window | null {
  const tab = window.open('about:blank', '_blank');
  if (tab) {
    tab.document.title = message;
    tab.document.body.style.cssText =
      'font: 16px/1.5 system-ui, sans-serif; color: #06183A; display: grid; place-items: center; height: 100vh; margin: 0';
    tab.document.body.textContent = message;
  }
  return tab;
}

/**
 * A one-hour preview link, signed by the editor who clicked.
 *
 * The secret is written into the dataset under the editor's own login, and
 * /api/draft checks it there. See that route for why this is not a password.
 */
async function previewUrl(client: SanityClient, userId: string | undefined, path: string) {
  const { secret } = await createPreviewSecret(
    client,
    'nile-explorer-studio',
    `${window.location.origin}/studio`,
    userId
  );
  const url = new URL('/api/draft', window.location.origin);
  url.searchParams.set(urlSearchParamPreviewSecret, secret);
  url.searchParams.set(urlSearchParamPreviewPathname, path);
  return url.toString();
}

/**
 * Preview: the page as it would look with the unpublished changes, visible to
 * this editor only. A yellow bar across the top of the site says so, with a
 * button to leave.
 */
export const PreviewAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion });
  const user = useCurrentUser();
  const toast = useToast();
  const [opening, setOpening] = useState(false);

  const path = pathFor(current(props));
  if (!path) return null;

  return {
    label: opening ? 'Opening preview…' : 'Preview',
    icon: EyeOpenIcon,
    disabled: opening,
    title: 'See this on the site with your unpublished changes. Only you can see it.',
    onHandle: async () => {
      const tab = openHoldingTab('Opening preview…');
      setOpening(true);
      try {
        const url = await previewUrl(client, user?.id, path);
        if (tab) tab.location.href = url;
        else window.open(url, '_blank');
      } catch (err) {
        tab?.close();
        toast.push({
          status: 'error',
          title: 'Could not open the preview',
          description: err instanceof Error ? err.message : String(err)
        });
      } finally {
        setOpening(false);
      }
    }
  };
};

/**
 * How long to wait between the publish landing and opening the page. The
 * publish webhook has to reach the site and expire its cache first; open any
 * sooner and the editor sees the old version and concludes it did not work.
 */
const SETTLE_MS = 6000;
/** Give up if the publish has not landed by then — it failed, or was blocked. */
const GIVE_UP_MS = 30_000;

/**
 * "Publish & view": the built-in Publish, then the live page in a new tab.
 *
 * It wraps Sanity's own Publish action rather than reimplementing it, so it is
 * disabled, validated and confirmed in exactly the same circumstances — a
 * document with errors cannot be published from here either.
 */
export function publishAndView(publish: DocumentActionComponent): DocumentActionComponent {
  const PublishAndView: DocumentActionComponent = (props) => {
    const original = publish(props);
    const pending = useRef<{ tab: Window | null; rev?: string; since: number } | null>(null);
    const path = pathFor(current(props));
    const publishedRev = props.published?._rev;

    // Open the page once the published revision changes, i.e. the publish
    // has actually landed.
    useEffect(() => {
      const p = pending.current;
      if (!p || !path || !publishedRev || publishedRev === p.rev) return;
      pending.current = null;
      const timer = window.setTimeout(() => {
        if (p.tab && !p.tab.closed) p.tab.location.href = new URL(path, window.location.origin).href;
      }, SETTLE_MS);
      return () => window.clearTimeout(timer);
    }, [publishedRev, path]);

    // Close the holding tab if nothing was ever published.
    useEffect(() => {
      const timer = window.setInterval(() => {
        const p = pending.current;
        if (p && Date.now() - p.since > GIVE_UP_MS) {
          p.tab?.close();
          pending.current = null;
        }
      }, 5000);
      return () => window.clearInterval(timer);
    }, []);

    if (!original || !path) return null;

    return {
      ...original,
      label: 'Publish & view',
      icon: LaunchIcon,
      title: 'Publish, then open the live page in a new tab.',
      onHandle: () => {
        pending.current = {
          tab: openHoldingTab('Publishing… the page opens in a few seconds.'),
          rev: publishedRev,
          since: Date.now()
        };
        original.onHandle?.();
      }
    };
  };
  PublishAndView.displayName = 'PublishAndView';
  return PublishAndView;
}
