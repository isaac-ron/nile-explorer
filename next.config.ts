import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Featured images imported from the existing WordPress site.
      { protocol: 'https', hostname: 'nilexplorer.net', pathname: '/wp-content/uploads/**' },
      // YouTube episode thumbnails.
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
      // Placeholder festival imagery. Remove this entry with the placeholders
      // once the inaugural festival has been shot; see src/lib/content.ts.
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' }
    ]
  },
  async redirects() {
    return [
      // Television was renamed to Documentaries. The old path was linked from
      // the nav, the footer and the podcast page for the whole of the previous
      // build, so it redirects rather than 404s.
      { source: '/television', destination: '/documentaries', permanent: true }
    ];
  }
};

export default nextConfig;
