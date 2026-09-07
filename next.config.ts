import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Featured images imported from the existing WordPress site.
      { protocol: 'https', hostname: 'nilexplorer.net', pathname: '/wp-content/uploads/**' },
      // YouTube episode thumbnails.
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' }
    ]
  }
};

export default nextConfig;
