import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // output: "export",
  // basePath: "/spectrum-industries.github.io",
    images: {
      domains: ['spectrum-album-bucket.s3.eu-north-1.amazonaws.com'],
    },  
};

export default nextConfig;
