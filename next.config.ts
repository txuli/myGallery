import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'photos.txuli.com',
        pathname: '/**',
      },
    ],
  },
};


export default nextConfig;
