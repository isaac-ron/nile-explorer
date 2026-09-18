import { createImageUrlBuilder } from '@sanity/image-url';
import type { Image as SanityImageSource } from 'sanity';
import { dataset, projectId } from '../../../sanity/env';
import type { Image } from '@/lib/content';

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * A Sanity image reference, as returned by the queries.
 *
 * Width and height come from the asset's own metadata, so next/image can
 * always reserve the right box. The old model had them nullable and every
 * render site carried a hardcoded fallback; that is why they are required here.
 */
export type SanityImage = {
  asset?: { _ref?: string; url?: string; metadata?: { dimensions?: { width: number; height: number } } };
  alt?: string;
  caption?: string;
  credit?: string;
};

/**
 * Base URL for an image, with no sizing applied.
 *
 * Sizing is added later by the loader in ./loader.ts, once next/image knows
 * which widths it actually needs. Doing it here as well would bake one width
 * into the src and defeat the responsive srcset.
 */
export const urlFor = (source: SanityImageSource) => builder.image(source);

/** Convert a queried Sanity image into the shape the site's components expect. */
export function toImage(source: SanityImage | null | undefined): Image | null {
  if (!source?.asset) return null;

  const dimensions = source.asset.metadata?.dimensions;
  return {
    url: source.asset.url ?? urlFor(source as SanityImageSource).url(),
    alt: source.alt ?? '',
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
    caption: source.caption ?? undefined,
    credit: source.credit ?? undefined
  };
}
