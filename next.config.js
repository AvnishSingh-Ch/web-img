/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // allow remote images if you decide to render <img> with next/image later
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'raw.githubusercontent.com' },
        { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
        { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
        { protocol: 'https', hostname: 'github.com' }
      ]
    }
  };
  
  module.exports = nextConfig;
  