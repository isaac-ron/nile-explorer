'use client';

import type { ImageLoaderProps } from 'next/image';

/**
 * Where next/image gets its images from.
 *
 * Images are resized by Sanity's CDN rather than by Vercel. Two reasons, and
 * the second is the one that matters day to day:
 *
 * 1. Cost. Image resizing and delivery is the one thing on this site with any
 *    real volume, and this puts all of it on Sanity's allowance instead of
 *    Vercel's meter.
 *
 * 2. Replacing a picture actually works. Next's own optimiser caches by URL
 *    with no way to invalidate it, so swapping a photo for a different one at
 *    the same address leaves the old one being served for hours. Sanity's URLs
 *    contain a hash of the file, so a new picture is a new address and appears
 *    immediately. An editor should not have to know why a photo did not change.
 *
 * Anything that is not a Sanity image — YouTube thumbnails, the logos in
 * /public — is passed through untouched. Those are already the right size and
 * there is nothing useful to do to them here.
 */
export default function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.startsWith('https://cdn.sanity.io/')) return src;

  const url = new URL(src);
  url.searchParams.set('auto', 'format'); // WebP where the browser takes it
  url.searchParams.set('fit', 'max'); // never upscale past the original
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality ?? 75));
  return url.toString();
}
