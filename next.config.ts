import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    /**
     * Images are resized by Sanity's CDN, not by Vercel. See the reasoning in
     * src/lib/sanity/loader.ts — briefly: it keeps image delivery on Sanity's
     * allowance rather than Vercel's meter, and it means replacing a photo
     * actually replaces it, which Next's own optimiser cannot promise because
     * its cache has no way to be invalidated.
     */
    loader: 'custom',
    loaderFile: './src/lib/sanity/loader.ts',

    /**
     * Required from Next 16 — an unrestricted list would let anyone generate
     * arbitrary renditions. One value is all the site asks for.
     */
    qualities: [75],

    /**
     * Not consulted while the custom loader is in use, since nothing goes
     * through Next's optimiser. Kept as the allowlist that would apply if the
     * loader were ever removed, so dropping back to the built-in optimiser is
     * one line rather than a debugging session.
     */
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' }
    ]
  },
  async redirects() {
    return [
      // Television was renamed to Documentaries. The old path was linked from
      // the nav, the footer and the podcast page for the whole of the previous
      // build, so it redirects rather than 404s.
      { source: '/television', destination: '/documentaries', permanent: true }

      // Redirects from the old WordPress permalinks go here at cutover. See
      // the Cutover section of HANDOVER.md: the slugs were preserved through
      // the migration, so most of these are only needed where WordPress used a
      // dated path such as /2025/09/the-headline.
    ];
  }
};

export default nextConfig;
